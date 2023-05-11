/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { MappingsClient } from "@itwin/insights-client";
import { createContext, useContext } from "react";
import { IModelsOdataClient } from "./imodels-odata-client/IModelsOdataClient";

export interface InsightsClients {
  mappingsClient: MappingsClient;
  iModelsOdataClient: IModelsOdataClient;
}

export const InsightsClientsContext = createContext<InsightsClients>({
  mappingsClient: new MappingsClient(),
  iModelsOdataClient: new IModelsOdataClient(),
});

export const useInsightsClients = () => {
  const context = useContext(InsightsClientsContext);
  if (!context) {
    throw new Error(
      "useInsightsClients should be used within a InsightsClientsContext provider."
    );
  }
  return context;
}