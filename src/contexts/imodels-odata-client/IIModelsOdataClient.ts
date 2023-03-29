/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import type {
  ODataEntityResponse,
  ODataEntityValue,
  ODataItem,
  ODataResponse,
  ODataTable,
} from "./interfaces/OData";
import type { EntityListIterator } from "./iterators/EntityListIterator";

export interface IIModelsOdataClient{
  /**
   * Lists all OData Entities for a Mapping.
   * @param {string} accessToken OAuth access token with scope `insights:read`.
   * @param {string} iModelId The iModel Id.
   * @param {string} changesetId The Changeset Id.
   * @param {string} mappingId The Mapping Id.
   * @memberof ReportingClient
   * @link https://developer.bentley.com/apis/imodels-odata/operations/mapping-odata/
   */
  getODataReport(
    accessToken: AccessToken,
    iModelId: string,
    changesetId: string,
    mappingId: string
  ): Promise<ODataResponse>;

  /**
   * Lists the specified page of raw table data for a Mapping Table (Group) Entity.
   * @param {string} accessToken OAuth access token with scope `insights:read`.
   * @param {string} iModelId The iModel Id.
   * @param {string} changesetId The Changeset Id.
   * @param {string} mappingId The Mapping Id.
   * @param {ODataItem} odataItem Reference to a Group in your Mapping. Use {@link getODataReport()} to fetch a list of ODataItems in the Mapping.
   * @param {number} sequence The number of the page to load.
   * @memberof ReportingClient
   * @link https://developer.bentley.com/apis/imodels-odata/operations/mapping-odata-entity/
   */
  getODataReportEntityPage(
    accessToken: AccessToken,
    iModelId: string,
    changesetId: string,
    mappingId: string,
    odataItem: ODataItem,
    sequence: number
  ): Promise<ODataEntityResponse>;

  /**
   * Lists the raw table data for a Mapping Table (Group) Entity. This method returns the full list of OData entities.
   * @param {string} accessToken OAuth access token with scope `insights:read`.
   * @param {string} iModelId The iModel Id.
   * @param {string} changesetId The Changeset Id.
   * @param {string} mappingId The Mapping Id.
   * @param {ODataItem} odataItem Reference to a Group in your Mapping. Use {@link getODataReport()} to fetch a list of ODataItems in the Mapping.
   * @memberof ReportingClient
   * @link https://developer.bentley.com/apis/imodels-odata/operations/mapping-odata-entity/
   */
  getODataReportEntities(
    accessToken: AccessToken,
    iModelId: string,
    changesetId: string,
    mappingId: string,
    odataItem: ODataItem
  ): Promise<Array<ODataEntityValue>>;

  /**
   * Gets an async iterator for the raw table data for a Mapping Table (Group) Entity.
   * This method returns an iterator which loads pages of OData  entities as it is being iterated over.
   * @param {string} accessToken OAuth access token with scope `insights:read`.
   * @param {string} iModelId The iModel Id.
   * @param {string} changesetId The Changeset Id.
   * @param {string} mappingId The Mapping Id.
   * @param {ODataItem} odataItem Reference to a Group in your Mapping. Use {@link getODataReport()} to fetch a list of ODataItems in the Mapping.
   * @memberof ReportingClient
   * @link https://developer.bentley.com/apis/imodels-odata/operations/mapping-odata-entity/
   */
  getODataReportEntitiesIterator(
    accessToken: AccessToken,
    iModelId: string,
    changesetId: string,
    mappingId: string,
    odataItem: ODataItem
  ): EntityListIterator<ODataEntityValue>;

  /**
   * Lists schemas for all Entities tied to a Mapping.
   * @param {string} accessToken OAuth access token with scope `insights:read`.
   * @param {string} iModelId The iModel Id.
   * @param {string} changesetId The Changeset Id.
   * @param {string} mappingId The Mapping Id.
   * @memberof ReportingClient
   * @link https://developer.bentley.com/apis/imodels-odata/operations/mapping-odata-metadata/
   */
  getODataReportMetadata(
    accessToken: AccessToken,
    iModelId: string,
    changesetId: string,
    mappingId: string
  ): Promise<ODataTable[]>;
}
