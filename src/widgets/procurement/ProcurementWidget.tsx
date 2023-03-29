/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "./ProcurementWidget.scss";

import { useActiveIModelConnection } from "@itwin/appui-react";
import { ColorDef } from "@itwin/core-common";
import { EmphasizeElements, IModelApp, IModelConnection } from "@itwin/core-frontend";
import { Group } from "@itwin/insights-client";
import { ProgressRadial } from "@itwin/itwinui-react";
import { useAccessToken } from "@itwin/web-viewer-react";
import { useCallback, useState } from "react";
import ProcurementDataTable, { ProcurementTableItem } from "./ProcurementDataTable";
import { ODataEntityValue, ODataTable } from "../../contexts/imodels-odata-client/interfaces/OData";
import { InsightsClients, useInsightsClients } from "../../contexts/InsightsClientsContext";
import DataSelectionFieldset from "../shared/DataSelectionFieldset";
import { GroupMetadata, PropertyMetadata } from "../shared/ODataDataTable";
import { getHiliteIds, zoomToElements } from "../shared/viewerUtils";

const ProcurementWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const insightsClients = useInsightsClients();
  const accessToken = useAccessToken();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [groupData, setGroupData] = useState<ODataEntityValue[] | undefined>();
  const [groupMetadata, setGroupMetadata] = useState<ODataTable | undefined>();
  const [quantityMetadata, setQuantityMetadata] = useState<GroupMetadata | undefined>();

  /** Helper function for loading metadata from a specified group and property. */
  const loadMetadata = async (accessToken: string | undefined, iModelConnection: IModelConnection | undefined, insightsClients: InsightsClients, mappingId: string, groupName: string) => {
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

    // extract property metadata
    let properties: PropertyMetadata[] = [];
    for (const prop of [...groupProps, ...calcProps, ...fnProps]) {
      properties.push({
        name: prop.propertyName,
        quantityType: prop.quantityType
      });
    }

    const metadata: GroupMetadata = {
      group: targetGroup!,
      properties: properties
    };
    return metadata;
  };

  /** Handles changes to the data table selection. When there is a selection change, 
   *   zoom to the selected elements.
   */
  const onChangeTableSelection = useCallback(async (selectedData: ProcurementTableItem[] | undefined) => {
    // don't need to do anything until a group table is selected
    if (!groupData) {
      return;
    }
    
    // ensure IModelApp selectedView is available
    if (!IModelApp.viewManager.selectedView) {
      return;
    }    

    // clear the old selection
    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearOverriddenElements(vp);
    emph.wantEmphasis = true;

    // reset to all elements hilited if no selections in table
    if (!selectedData || selectedData.length === 0) {
      const selected = groupData.map(x => (x.ECInstanceId as string));
      const hiliteSet = await getHiliteIds(selected);
      emph.emphasizeElements(hiliteSet, vp);
      emph.overrideElements(hiliteSet, vp, ColorDef.red, undefined, false);
      await zoomToElements(hiliteSet);
      return;
    }
    
    // emphasize the relevant elements
    let selected: string[] = [];
    for (const row of selectedData) {
      const rowEntities = JSON.parse(row["entities"] as string) as ODataEntityValue[];
      selected = [...selected, ...rowEntities.map(x => x.ECInstanceId as string)];
    }
    const hiliteSet = await getHiliteIds(selected);
    emph.emphasizeElements(hiliteSet, vp);
    emph.overrideElements(hiliteSet, vp, ColorDef.red, undefined, false);
    await zoomToElements(hiliteSet);
  }, [groupData]);

  /** Handles configuration change events from the DataSelectionFieldset component. */
  const onChangeConfiguration = useCallback(async (mappingId: string | null, groupMetadata: ODataTable | null) => {
    setIsLoading(true);
    // if any of the required configurations are unset, don't do anything
    if (!mappingId || !groupMetadata) {
      return;
    }
    
    // validate the iModelConnection is established and fetch the raw Group Table data
    if (!iModelConnection || !iModelConnection.iTwinId || !iModelConnection.iModelId || !iModelConnection.changeset || !accessToken || !mappingId) {
      return;
    }
    const groupData = await insightsClients.iModelsOdataClient.getODataReportEntities(
      accessToken,
      iModelConnection.iModelId!,
      iModelConnection.changeset.id,
      mappingId!,
      { name: "", url: groupMetadata.name });

    // load metadata for the selected group
    let propertyMetadata = await loadMetadata(accessToken, iModelConnection, insightsClients, mappingId, groupMetadata.name);
    setQuantityMetadata(propertyMetadata);

    // propagate state changes to the data table component
    setGroupData(groupData);
    setGroupMetadata(groupMetadata);
    setIsLoading(false);
  }, [iModelConnection, accessToken, insightsClients]);

  return (
    <div className='widget-container'>
      <DataSelectionFieldset onChange={onChangeConfiguration} hidePropertySelect={true}/>
      { isLoading &&
        <ProgressRadial indeterminate className="progress-spinner"/>
      }
      <ProcurementDataTable tableData={groupData} tableMetadata={groupMetadata} quantityMetadata={quantityMetadata} isLoading={isLoading} onSelect={onChangeTableSelection} />
    </div>
  );
}

export default ProcurementWidget;