/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "./ODataDataTable.scss";

import { useEffect, useMemo, useState } from "react";
import { Group, QuantityType } from "@itwin/insights-client";
import { Fieldset, Table } from "@itwin/itwinui-react";
import { ODataEntityValue, ODataTable } from "../../contexts/imodels-odata-client/interfaces/OData";
import { quantityTypeToDisplayUnits } from "./dataUtils";

/** Helper interface used for Group metadata */
export interface GroupMetadata {
  group: Group;
  properties: PropertyMetadata[];
}

/** Helper interface used for Property metadata */
export interface PropertyMetadata {
  name: string;
  quantityType: QuantityType;
}

interface ODataTableProps {
  /** The raw Table (Group) data. */
  tableData: ODataEntityValue[] | undefined;
  /** The Table metadata - Column names, types, etc. */
  tableMetadata: ODataTable | undefined;
  /** The Table column types metadata */
  quantityMetadata: GroupMetadata | undefined;
  /** Hides the rendered table when new data is being loaded. */
  isLoading: boolean;
  /** Callback function that sends an event when table rows are selected. */
  onSelect: (selectedData: ODataEntityValue[] | undefined) => void;
  /** Hide all columns specified in mask. */
  columnMask?: string[];
}

/** Component dedicated to rendering a UI table of the entire contents of the Group
 *   (or Table) selected. This component allows the user to select any number of rows
 *   of data and see the corresponding elements emphasized in the 3D Viewer.
 */
const ODataDataTable = ({ tableData, tableMetadata, quantityMetadata, isLoading, onSelect, columnMask }: ODataTableProps) => {
  const columns = useMemo(() => {
    return tableMetadata?.columns
      .filter((x) => !columnMask?.includes(x.name))
      .map((x) => ({
        id: x.name,
        // Column Header is a string formatted as "{name} {units}"
        //  Where {name} and {units} come from tableMetaData
        //  {units} must be looked up from the Quantity Type
        Header: `${x.name} ${(() => {
          const propLookup = quantityMetadata?.properties.filter((p) => p.name === x.name);
          const hasQuantity = propLookup && propLookup.length > 0 && propLookup[0].quantityType !== QuantityType.Undefined;
          return hasQuantity
            ? `(${quantityTypeToDisplayUnits(propLookup[0].quantityType)})`
            : "";
        })()}`,
        accessor: x.name, }));
  }, [tableMetadata, quantityMetadata, columnMask]);

  /** When new Table (Group) data is received, reset any emphasized elements in the 3D Viewer. */
  useEffect(() => {
    onSelect(tableData);
  }, [tableData, onSelect]);

  return (
    <div>
      { !isLoading && 
        <Fieldset legend="Mapping data table" className="odata-data-table">
          <div className="table">
            <div className="count-div">
              <span className="count-text">Count: </span>
              <span>{ tableData?.length ?? "-" }</span>
            </div>
            <Table
              columns={[{
                Header: "Header name",
                columns: columns ?? [],
              }]}
              data={[...tableData?.values() ?? []]}
              emptyTableContent="No data."
              isLoading={isLoading}
              isSortable={false}
              isSelectable={true}
              onSelect={onSelect}
              density="extra-condensed"
            />
          </div>
        </Fieldset>
      }
    </div>
  );
};

export default ODataDataTable;