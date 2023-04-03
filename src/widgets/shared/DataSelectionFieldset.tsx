/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "./DataSelectionFieldset.scss";

import { useCallback, useEffect, useState } from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Mapping } from "@itwin/insights-client";
import { SvgRefresh } from "@itwin/itwinui-icons-react";
import { Fieldset, IconButton, LabeledSelect } from "@itwin/itwinui-react";
import { useAccessToken } from "@itwin/web-viewer-react";
import { ODataTable } from "../../contexts/imodels-odata-client/interfaces/OData";
import { useInsightsClients } from "../../contexts/InsightsClientsContext";

interface DataSelectionFieldsetProps {
  /** Callback function that lets the parent component know when a Mapping, Table, and Column have been selected. */
  onChange: (mappingId: string, tableMetaData: ODataTable, columnName: string) => void;
  /** Optionally hide Property selection. */
  hidePropertySelect?: boolean;
  /** Optionally restrict allowed data types. */
  allowedDataTypes?: string[];
}

/** Component that assists with selecting a Mapping, a Group (or Table), and a numeric
 *   Property (or Column). Three dropdowns are rendered and the user is expected to select
 *   each item in the hierarchy one at a time.
 */
const DataSelectionFieldset = ({ onChange, hidePropertySelect, allowedDataTypes }: DataSelectionFieldsetProps) => {
  const iModelConnection = useActiveIModelConnection();
  const insightsClients = useInsightsClients();
  const accessToken = useAccessToken();
  const [mappingId, setMappingId] = useState<string | undefined>();
  const [allMappings, setAllMappings] = useState<Mapping[]>([]);
  const [group, setGroup] = useState<ODataTable | undefined>();
  const [allGroups, setAllGroups] = useState<ODataTable[]>([]);
  const [property, setProperty] = useState<string | undefined>();

  /** Fetch all mappings for the active iModel. */
  const initMappingSelection = useCallback(() => {
    setAllMappings([]);
    setMappingId(undefined);
    setGroup(undefined);
    if (!iModelConnection || !iModelConnection.iTwinId || !iModelConnection.iModelId || !accessToken) {
      return;
    }
    const fetchAndSetMappings = async () => {
      var reps = await insightsClients.mappingsClient.getMappings(accessToken, iModelConnection.iModelId!);
      setAllMappings(reps);
    };
    void fetchAndSetMappings();
  }, [iModelConnection, accessToken, insightsClients]);

  /** As soon as a valid connection is opened fetch all Mappings. */
  useEffect(() => {
    void initMappingSelection();
  }, [initMappingSelection]);

  /** Once a Mapping is selected, fetch all available Tables (or Groups) in that Mapping. */
  useEffect(() => {
    setAllGroups([]);
    if (!iModelConnection || !iModelConnection.iTwinId || !iModelConnection.iModelId || !iModelConnection.changeset || !accessToken || !mappingId) {
      return;
    }
    const fetchAndSetTables = async () => {
      const tables = await insightsClients.iModelsOdataClient.getODataReportMetadata(accessToken, iModelConnection.iModelId!, iModelConnection.changeset.id, mappingId!);
      setAllGroups(tables);
    };
    void fetchAndSetTables();
  }, [iModelConnection, accessToken, insightsClients, mappingId]);

  /** Only when a Property is selected, propagate configuration selections to the parent component. */
  useEffect(() => {
    if (!mappingId || !group || !property) {
      return;
    }
    onChange(mappingId, group, property);
  }, [onChange, mappingId, group, property])

  return (
    <Fieldset legend="Data selection" className="data-selection-fieldset">
      <IconButton className="refresh-button" onClick={initMappingSelection}>
        <SvgRefresh />
      </IconButton>
      <div className="data-selection-fieldset-row">
        <LabeledSelect<string | undefined>
          label={"Mapping"}
          disabled={allMappings.length === 0}
          options={[
            { value: undefined, label: "" },
            ...allMappings.map((m) => ({ value: m.id, label: m.mappingName }))
          ]}
          value={mappingId}
          onChange={(id) => {
            if (mappingId !== id) {
              setGroup(undefined);
              setAllGroups([]);
              setProperty(undefined);
            }
            setMappingId(id);
          }}
        />
      </div>
      <div className="data-selection-fieldset-row">
        <LabeledSelect<ODataTable | undefined>
          label={"Group"}
          disabled={allGroups.length === 0}
          options={[
            { value: undefined, label: "" },
            ...allGroups.map((t) => ({ value: t, label: t.name }))
          ]}
          value={group}
          onChange={(t) => {
            if (group !== t) {
              setProperty(undefined);
            }
            const cols = t?.columns;
            if (hidePropertySelect && cols && cols.length > 0) {
              setProperty(cols[0].name);
            }
            setGroup(t);
          }}
        />
      </div>
      {!hidePropertySelect &&
        <div className="data-selection-fieldset-row">
          <LabeledSelect<string | undefined>
            label={"Property"}
            disabled={!group}
            options={[
              { value: undefined, label: "" },
              ...(!group ? [] : group.columns
                .filter((p) => allowedDataTypes ? allowedDataTypes.includes(p.type) : true)
                .map((p) => ({ value: p.name, label: p.name }))
              )
            ]}
            value={property}
            onChange={setProperty}
          />
        </div>
      }
    </Fieldset>
  );
};

export default DataSelectionFieldset;
