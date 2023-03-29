/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
export interface ODataItem {
  /**
   *
   * @type {string}
   * @memberof ODataItem
   */
  name: string;
  /**
   *
   * @type {string}
   * @memberof ODataItem
   */
  url: string;
}

/**
 * OData response.
 * @export
 * @interface ODataResponse
 */
export interface ODataResponse {
  /**
   * OData Schema
   * @type {string}
   * @memberof ODataResponse
   */
  "@odata.context": string;
  /**
   *
   * @type {Array<ODataItem>}
   * @memberof ODataResponseStatus
   */
  value: Array<ODataItem>;
}

/**
 * OData Entity response.
 * @export
 * @interface ODataEntityResponse
 */
export interface ODataEntityResponse {
  /**
   * OData Schema
   * @type {string}
   * @memberof ODataResponse
   */
  "@odata.context": string;
  /**
   *
   * @type {Array<[key: string]: string>}
   * @memberof ODataResponseStatus
   */
  value: Array<ODataEntityValue>;
  /**
   *
   * @type {string}
   * @memberof ODataResponse
   */
  "@odata.nextLink"?: string;
}

export interface ODataEntityValue { [key: string]: string | number | boolean | null}

/**
 * OData MetaData table.
 * @export
 * @interface ODataTable
 */
export interface ODataTable {
  /**
   * Table name
   * @type {string}
   * @memberof ODataTable
   */
  name: string;
  /**
   * Table columns
   * @type {string}
   * @memberof ODataTable
   */
  columns: ODataColumn[];
}

/**
 * OData MetaData property.
 * @export
 * @interface ODataColumn
 */
export interface ODataColumn {
  /**
   * Property name
   * @type {string}
   * @memberof ODataColumn
   */
  name: string;
  /**
   * Property type
   * @type {string}
   * @memberof ODataColumn
   */
  type: string;
}

/**
 * OData MetaData property.
 * @export
 * @interface ODataMetaDataProperty
 */
export interface ODataMetaDataProperty {
  /**
   * Property name
   * @type {string}
   * @memberof ODataMetaDataProperty
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Name: string;
  /**
   * Property type
   * @type {string}
   * @memberof ODataMetaDataProperty
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Type: string;
}

/**
 * OData MetaData property.
 * @export
 * @interface ODataMetaDataSchema
 */
export interface ODataMetaDataSchema {
  /**
  * Property name
  * @type {string}
  * @memberof ODataMetaDataSchema
  */
  entityType: ODataMetaDataEntityType;
  /**
   * Property name
   * @type {string}
   * @memberof ODataMetaDataSchema
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Namespace: string;
  /**
   * Property type
   * @type {string}
   * @memberof ODataMetaDataSchema
   */
  xmlns: string;
}

/**
 * OData MetaData property.
 * @export
 * @interface ODataMetaDataEntityType
 */
export interface ODataMetaDataEntityType {
  /**
  * Property name
  * @type {ODataMetaDataProperty}
  * @memberof ODataMetaDataEntityType
  */
  property: ODataMetaDataProperty[];
  /**
   * Property name
   * @type {string}
   * @memberof ODataMetaDataEntityType
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Name: string;
}

/**
 * OData MetaData property.
 * @export
 * @interface ODataMetaDataEntitySet
 */
export interface ODataMetaDataEntitySet {
  /**
  * Property name
  * @type {ODataMetaDataProperty}
  * @memberof ODataMetaDataEntitySet
  */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Name: string;
  /**
   * Property name
   * @type {string}
   * @memberof ODataMetaDataEntitySet
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  EntityType: string;
}