/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "./EnvironmentalImpactWidget.scss";

import { useActiveIModelConnection } from "@itwin/appui-react";
import { ColorDef } from "@itwin/core-common";
import { EmphasizeElements, IModelApp, IModelConnection } from "@itwin/core-frontend";
import { Group, ODataEntityValue, QuantityType } from "@itwin/insights-client";
import { ProgressRadial } from "@itwin/itwinui-react";
import { useAccessToken } from "@itwin/web-viewer-react";
import { useCallback, useState } from "react";
import { ODataTable } from "../../contexts/imodels-odata-client/interfaces/OData";
import { InsightsClients, useInsightsClients } from "../../contexts/InsightsClientsContext";
import DataSelectionFieldset from "../shared/DataSelectionFieldset";
import { GroupMetadata } from "../raw-odata/ODataDataTable";
import { getHiliteIds, zoomToElements } from "../shared/viewerUtils";
import GradientLegend from "./GradientLegend";

const numericODataTypes = [ "Edm.Int16", "Edm.Int32", "Edm.Int64", "Edm.Single", "Edm.Double", "Edm.Decimal" ];

/** Helper interface used when splitting */
interface HeatmapDataBin {
  depth: number;
  data: ODataEntityValue[];
  min: number;
  max: number;
  wasSplit: boolean;
}

/** Top-level component of the Environmental Impact widget. Orchestrates selection of desired Mapping, Group
 *   and property. Downloads relevant Reporting data using the iModels OData API and renders a Heatmap
 *   of relative environmental impact in the 3D Viewer.
 */
const EnvironmentalImpactWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const insightsClients = useInsightsClients();
  const accessToken = useAccessToken();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [valueBounds, setValueBounds] = useState<{ min: number, max: number } | undefined>();
  const [quantityType, setQuantityType] = useState<QuantityType | undefined>(QuantityType.Undefined);

  /** Helper function for loading data from a specified group. */
  const loadGroupData = async (accessToken: string | undefined, iModelConnection: IModelConnection | undefined, insightsClients: InsightsClients, mappingId: string, groupName: string) => {
    // validate the iModelConnection is established and fetch the raw Group Table data
    if (!iModelConnection || !iModelConnection.iTwinId || !iModelConnection.iModelId || !iModelConnection.changeset || !accessToken || !mappingId) {
      return;
    }

    return await insightsClients.iModelsOdataClient.getODataReportEntities(
      accessToken,
      iModelConnection.iModelId!,
      iModelConnection.changeset.id,
      mappingId!,
      { name: "", url: groupName });
  };

  /** Helper function for loading metadata from a specified group and property. */
  const loadMetadata = async (accessToken: string | undefined, iModelConnection: IModelConnection | undefined, insightsClients: InsightsClients, mappingId: string, groupName: string, propertyName: string) => {
    // validate the iModelConnection is established and fetch the raw Group Table data
    if (!iModelConnection || !iModelConnection.iTwinId || !iModelConnection.iModelId || !iModelConnection.changeset || !accessToken || !mappingId) {
      return;
    }

    // fetch all groups
    const groups = await insightsClients.mappingsClient.getGroups(
      accessToken,
      iModelConnection.iModelId!,
      mappingId!,
    );

    // locate target group by name
    let targetGroup: Group;
    for (const group of groups) {
      if (group.groupName === groupName) {
        targetGroup = group;
        break;
      }
    }

    // fetch all group properties
    const groupProps = await insightsClients.mappingsClient.getGroupProperties(
      accessToken,
      iModelConnection.iModelId!,
      mappingId!,
      targetGroup!.id
    );
    const calcProps = await insightsClients.mappingsClient.getCalculatedProperties(
      accessToken,
      iModelConnection.iModelId!,
      mappingId!,
      targetGroup!.id
    );
    const fnProps = await insightsClients.mappingsClient.getCustomCalculations(
      accessToken,
      iModelConnection.iModelId!,
      mappingId!,
      targetGroup!.id
    );

    // locate target property
    let quantityType: QuantityType;
    for (const prop of [...groupProps, ...calcProps, ...fnProps]) {
      if (prop.propertyName === propertyName) {
        quantityType = prop.quantityType;
        break;
      }
    }

    const metadata: GroupMetadata = {
      group: targetGroup!,
      properties: [{
        name: propertyName,
        quantityType: quantityType!
      }]
    };
    return metadata;
  };

  /** Helper function to compute and render embodied carbon heatmap. */
  const generateHeatmap = async (groupData: ODataEntityValue[], propertyName: string): Promise<string[] | undefined> => {
    // ensure IModelApp selectedView is available
    if (!IModelApp.viewManager.selectedView) {
      return;
    }
    
    // clear the old heatmap
    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearOverriddenElements(vp);
    emph.wantEmphasis = true;

    // generate the new heatmap
    
    // calculate the range of values
    const targetColData = groupData.map(row => row[propertyName] as number);
    const minVal = Math.min(...targetColData);
    const maxVal = Math.max(...targetColData);
    setValueBounds({ max: maxVal, min: minVal });

    // define function to map values to ColorDefs
    const calculateHeatmapColorDef = (val: number, min: number, max: number) => {
      // handle divide-by-zero case - default to rendering as RED if all values are equal
      if (min === max) {
        min--;
      }
      // normalize data to range [0, 1]
      const normalizedVal = (val - min) / (max - min);
      // compute HSL color value and generate a ColorDef based on that
      const hsl = (1.0 - normalizedVal) * 0.6;
      return ColorDef.fromHSL(hsl, 1.0, 0.5);
    };

    // optimize heatmap hiliteset fetching by binning elements into groups
    const overloadedBinThreshold = 0.2;
    const maxIterationDepth = 4;
    const splitsPerIteration = 10;

    let bins: HeatmapDataBin[] = [
      { depth: 0, data: groupData, min: minVal, max: maxVal * 1.0001, wasSplit: false }
    ];
    // iterate only for restricted number of iterations
    for (let currIter = 0; currIter <= maxIterationDepth; currIter++) {
      // only look at bins that were previously split
      const targetBins = bins.filter(b => b.depth === currIter);
      for (const bin of targetBins) {
        // determine if bin needs to be split
        if (bin.data.length <= groupData.length * overloadedBinThreshold) {
          continue;
        }
        
        // mark for split and instantiate new bins
        bin.wasSplit = true;
        const segmentSize = (bin.max - bin.min) / splitsPerIteration;
        const newBins: HeatmapDataBin[] = [];
        for (let i = 0; i < splitsPerIteration; i++) {
          newBins.push({ 
            depth: currIter + 1,
            data: [],
            min: bin.min + segmentSize * i,
            max: bin.min + segmentSize * (i + 1),
            wasSplit: false });
        }

        // distribute data into new bins
        for (const row of bin.data) {
          const val = row[propertyName] as number;
          const idx = Math.floor((val - bin.min) / segmentSize);
          newBins[idx].data.push(row);
        }
        bins = [...bins, ...newBins];
      }
    }
    
    // iterate over all elements and apply Heatmap color
    let allElements = [];
    for (const bin of bins) {
      const colorDef = calculateHeatmapColorDef((bin.min + bin.max) / 2, minVal, maxVal);
      const hiliteSet = await getHiliteIds(bin.data.map(row => row["ECInstanceId"] as string));
      emph.overrideElements(hiliteSet, vp, colorDef, undefined, false);
      allElements.push(...hiliteSet);
    }
    
    // emphasize the relevant elements
    emph.emphasizeElements(allElements, vp);
    await zoomToElements(allElements);
  }

  /** Handles configuration change events from the DataSelectionFieldset component. */
  const onChangeConfiguration = useCallback(async (mappingId: string | null, tableMetaData: ODataTable | null, propertyName: string | null) => {
    setIsLoading(true);
    // if any of the required configurations are unset, don't do anything
    if (!mappingId || !tableMetaData || !propertyName) {
      return;
    }
    
    // load data for the selected group
    let groupData = await loadGroupData(accessToken, iModelConnection, insightsClients, mappingId, tableMetaData.name);
    if (!groupData) {
      return;
    }

    // load metadata for the selected group
    let metadata = await loadMetadata(accessToken, iModelConnection, insightsClients, mappingId, tableMetaData.name, propertyName);
    setQuantityType(metadata?.properties[0].quantityType);

    // filter null/undefined values out of groupData
    groupData = groupData.filter((d) => d[propertyName]);

    // generate heatmap
    await generateHeatmap(groupData, propertyName);
    setIsLoading(false);
  }, [iModelConnection, accessToken, insightsClients]);
  
  return (
    <div className='widget-container'>
      <DataSelectionFieldset onChange={onChangeConfiguration} allowedDataTypes={numericODataTypes} />
      { isLoading &&
        <ProgressRadial indeterminate className="progress-spinner"/>
      }
      { valueBounds && quantityType &&
        <GradientLegend maxVal={valueBounds.max} minVal={valueBounds.min} quantityType={quantityType} title="Embodied Carbon" />
      }
    </div>
  );
}

export default EnvironmentalImpactWidget;
