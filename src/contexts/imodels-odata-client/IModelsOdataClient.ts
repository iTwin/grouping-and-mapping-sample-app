/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import type { AccessToken } from "@itwin/core-bentley";
import { RequiredError } from "./interfaces/Errors";
import type { PagedResponseLinks } from "./interfaces/Links";
import {
  ODataEntityResponse,
  ODataEntityValue,
  ODataItem,
  ODataResponse,
} from "./interfaces/OData";
import type { EntityListIterator } from "./iterators/EntityListIterator";
import { EntityListIteratorImpl } from "./iterators/EntityListIteratorImpl";
import { Collection, getEntityCollectionPage } from "./iterators/IteratorUtil";
import { OperationsBase } from "./OperationsBase";
import type { IIModelsOdataClient } from "./IIModelsOdataClient";
import { ODataTable } from "@itwin/insights-client";

export class IModelsOdataClient extends OperationsBase implements IIModelsOdataClient {
  public async getODataReport(accessToken: AccessToken, iModelId: string, changesetId: string, mappingId: string): Promise<ODataResponse> {
    const url = `${this.basePath}/${encodeURIComponent(iModelId)}/changesets/${encodeURIComponent(changesetId)}/mappings/${encodeURIComponent(mappingId)}/odata`;
    const requestOptions: RequestInit = this.createRequest("GET", accessToken);
    return this.fetchJSON<ODataResponse>(url, requestOptions);
  }

  public async getODataReportEntityPage(accessToken: AccessToken, iModelId: string, changesetId: string, mappingId: string, odataItem: ODataItem, sequence: number): Promise<ODataEntityResponse> {
    const segments = odataItem.url.split("/");  // region, manifestId, entityType
    if (segments.length !== 1) {
      throw new RequiredError(
        "odataItem",
        "Parameter odataItem item was invalid.",
      );
    }
    const url = `${this.basePath}/${encodeURIComponent(iModelId)}/changesets/${encodeURIComponent(changesetId)}/mappings/${encodeURIComponent(mappingId)}/odata/${odataItem.url}?sequence=${encodeURIComponent(sequence)}`;
    const requestOptions: RequestInit = this.createRequest("GET", accessToken);
    return this.fetchJSON(url, requestOptions);
  }

  public async getODataReportEntities(accessToken: AccessToken, iModelId: string, changesetId: string, mappingId: string, odataItem: ODataItem): Promise<Array<ODataEntityValue>> {
    const segments = odataItem.url.split("/");  // region, manifestId, entityType
    if (segments.length !== 1) {
      throw new RequiredError(
        "odataItem",
        "Parameter odataItem item was invalid.",
      );
    }
    const reportData: Array<ODataEntityValue> = [];
    const oDataReportEntitiesIt = this.getODataReportEntitiesIterator(accessToken, iModelId, changesetId, mappingId, odataItem);
    for await (const oDataReportEntity of oDataReportEntitiesIt) {
      reportData.push(oDataReportEntity);
    }
    return reportData;
  }

  public getODataReportEntitiesIterator(accessToken: AccessToken, iModelId: string, changesetId: string, mappingId: string, odataItem: ODataItem): EntityListIterator<ODataEntityValue> {
    const segments = odataItem.url.split("/");  // region, manifestId, entityType
    if (segments.length !== 1) {
      throw new RequiredError(
        "odataItem",
        "Parameter odataItem item was invalid.",
      );
    }
    const url = `${this.basePath}/${encodeURIComponent(iModelId)}/changesets/${encodeURIComponent(changesetId)}/mappings/${encodeURIComponent(mappingId)}/odata/${odataItem.url}`;
    const request = this.createRequest("GET", accessToken);
    return new EntityListIteratorImpl(async () => getEntityCollectionPage<ODataEntityValue>(
      url,
      async (nextUrl: string): Promise<Collection<ODataEntityValue>> => {
        const response: ODataEntityResponse = await this.fetchJSON<ODataEntityResponse>(nextUrl, request);
        const link: PagedResponseLinks = {
          self: {
            href: nextUrl,
          },
        };
        if (response["@odata.nextLink"]) {
          link.next = {
            href: response["@odata.nextLink"],
          };
        }
        return {
          values: response.value,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _links: link,
        };
      }));
  }

  public async getODataReportMetadata(accessToken: AccessToken, iModelId: string, changesetId: string, mappingId: string): Promise<ODataTable[]> {
    const url = `${this.basePath}/${encodeURIComponent(iModelId)}/changesets/${encodeURIComponent(changesetId)}/mappings/${encodeURIComponent(mappingId)}/odata/$metadata`;
    const requestOptions: RequestInit = this.createRequest("GET", accessToken);
    const response = await this.fetchData(url, requestOptions);
    return this.parseXML(response);
  }

  private async parseXML(response: Response): Promise<ODataTable[]> {
    const parser = new DOMParser();
    const text = await response.text();
    const parsedXML = parser.parseFromString(text, "text/xml");
    if (!parsedXML.getElementsByTagName("Schema").length) {
      return [];
    }

    const schemas = Array.from(parsedXML.getElementsByTagName("Schema"));
    const defaultSchema = schemas.find(s => s.getAttribute("Namespace") === "Default");
    if (defaultSchema === undefined) {
      return [];
    }
    return Array.from(defaultSchema.getElementsByTagName("EntityType")).map(t => {
      const tName = t.getAttribute("Name");
      if (!tName)
        throw new Error("Invalid Entity Type in Schema");
      return {
        name: tName,
        columns: Array.from(t.getElementsByTagName("Property")).map(p => {
          const pName = p.getAttribute("Name");
          const pType = p.getAttribute("Type");
          if (!pName || !pType)
            throw new Error("Invalid Property in Schema");
          return {
            name: pName,
            type: pType,
          };
        })
      };
    });
  }
}