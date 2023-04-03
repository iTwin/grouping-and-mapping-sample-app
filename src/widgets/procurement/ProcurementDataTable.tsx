/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "./ProcurementDataTable.scss";

import { useEffect, useState, useMemo } from "react";
import { QuantityType } from "@itwin/insights-client";
import { Fieldset, Table } from "@itwin/itwinui-react";
import { ODataEntityValue, ODataTable } from "../../contexts/imodels-odata-client/interfaces/OData";
import { quantityTypeToDisplayUnits, roundTo3 } from "../shared/dataUtils";
import { GroupMetadata } from "../raw-odata/ODataDataTable";

/** Properties added by reporting that we will ignore for Procurement. */
const defaultProps = [ "ECInstanceId", "ECClassId", "BBoxLow", "BBoxHigh", "UserLabel" ];

/** Special case data columns for Procurement workflow. */
const COL_IGNORE = "Ignore"; // Table data with an 'Ignore' column will be used to filter data rows.

interface ProcurementTableProps {
  /** The raw Table (Group) data. */
  tableData: ODataEntityValue[] | undefined;
  /** The Table metadata - Column names, types, etc. */
  tableMetadata: ODataTable | undefined;
  /** The Table column types metadata */
  quantityMetadata: GroupMetadata | undefined;
  /** Hides the rendered table when new data is being loaded. */
  isLoading: boolean;
  /** Callback function that sends an event when table rows are selected. */
  onSelect: (selectedData: ProcurementTableItem[] | undefined) => void;
}

/** Object interface for the aggregated Procurement table. */
export interface ProcurementTableItem {
  [key: string]: string | number | boolean | null;
}

/** Component dedicated to rendering a UI table of summarized contents of the Group
 *   (or Table) selected. Entries in this table will be grouped by a specified property
 *   and their counts will be aggregated.
 */
 const ProcurementDataTable = ({ tableData, tableMetadata, quantityMetadata, isLoading, onSelect }: ProcurementTableProps) => {
  const [procurementData, setProcurementData] = useState<ProcurementTableItem[] | undefined>();
  const [totalCount, setTotalCount] = useState<number>(0);
  // Define the column headers for the table
  const columns = useMemo(() => {
    return [
      ...tableMetadata?.columns
        .filter((x) => !defaultProps?.includes(x.name))
        .map((x) => ({ 
          id: x.name, 
          /** Column Header is a string formatted as "{name} {units}"
           * Where {name} and {units} come from tableMetaData
           * {units} must be looked up from the Quantity Type
          */
          Header: `${x.name} ${(() => {
            const propLookup = quantityMetadata?.properties.filter((p) => p.name === x.name);
            const hasQuantity = propLookup && propLookup.length > 0 && propLookup[0].quantityType !== QuantityType.Undefined;
            return hasQuantity
              ? `(${quantityTypeToDisplayUnits(propLookup[0].quantityType)})`
              : "";
          })()}`, 
          accessor: x.name, }))
      ?? [],
      ...procurementData ? [{ id: "Count", Header: "Count", accessor: "count" }] : [],
    ]
  }, [tableMetadata, quantityMetadata, procurementData]);

  /** When new Table (Group) data is received, reset any emphasized elements in the 3D Viewer. */
  useEffect(() => {
    onSelect(undefined);
  }, [tableData, onSelect]);

  /** Compute aggregated Procurement table when new Table (Group) data is received. */
  useEffect(() => {
    // bail if any data is not yet loaded
    if (!tableData || !tableMetadata) {
      return;
    }

    // property hash function to local unique combinations of properties in the selected Group's rows
    const generatePropertyHash = (row: ODataEntityValue, metadata: ODataTable) => {
      let keys = [];
      for (const col of metadata.columns) {
        if (!defaultProps.includes(col.name)) {
          let value = row[col.name];
          value = typeof value === "number" ? roundTo3(value) : value;
          if (value === undefined) continue;
          keys.push(`${col.name}|${JSON.stringify(value)}`);
        }
      }
      return keys.join('||');
    }

    // deconstruct properties from hash string
    const deconstructPropertyHash = (hash: string): any => {
      let rebuiltObj: any = {};

      const properties = hash.split("||");
      for (const property of properties) {
        const keyValPair = property.split("|");
        rebuiltObj[keyValPair[0]] = JSON.parse(keyValPair[1]);
      }

      return rebuiltObj;
    }

    // iterate through data and map into aggregation buckets
    let mappedData: Map<string, ODataEntityValue[]> = new Map();
    for (const row of tableData) {
      // skip 'Ignore' rows
      if (tableMetadata.columns.find(c => c.name === COL_IGNORE)) {
        if (row[COL_IGNORE] === COL_IGNORE) continue;
      }

      // bucket data
      const rowKeyValue = generatePropertyHash(row, tableMetadata);
      if (mappedData.has(rowKeyValue)) {
        mappedData.get(rowKeyValue)?.push(row);
      } else {
        mappedData.set(rowKeyValue, [row]);
      }
    }

    // reshape for procurement table
    let procurementData: ProcurementTableItem[] = [];
    let totalCount = 0;
    mappedData.forEach((rows, groupKeyValue) => {
      if (!rows || !groupKeyValue) return;
      let newEntry = deconstructPropertyHash(groupKeyValue);
      newEntry.count = rows.length;
      newEntry.entities = JSON.stringify(rows);
      procurementData.push(newEntry);
      totalCount += rows.length;
    });
    
    setProcurementData(procurementData);
    setTotalCount(totalCount);
  }, [tableData, tableMetadata]);

  return (
    <div>
      { !isLoading && 
        <Fieldset legend="Bill of Materials" className="procurement-data-table">
          <div className="table">
            <div className="total-div">
              <span className="total-text">Total: </span>
              <span>{ totalCount }</span>
            </div>
            <Table
              columns={[{
                Header: "Header name",
                columns,
              }]}
              data={[...procurementData?.values() ?? []]}
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

export default ProcurementDataTable;