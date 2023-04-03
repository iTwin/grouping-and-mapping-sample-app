/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "./App.scss";

import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import type { ScreenViewport } from "@itwin/core-frontend";
import { FitViewTool, IModelApp, StandardViewId } from "@itwin/core-frontend";
import { FillCentered } from "@itwin/core-react";
import { ProgressLinear } from "@itwin/itwinui-react";
import {
  MeasureTools,
  MeasureToolsUiItemsProvider,
} from "@itwin/measure-tools-react";
import {
  PropertyGridManager,
  PropertyGridUiItemsProvider,
} from "@itwin/property-grid-react";
import {
  TreeWidget,
  TreeWidgetUiItemsProvider,
} from "@itwin/tree-widget-react";
import {
  useAccessToken,
  Viewer,
  ViewerContentToolsProvider,
  ViewerNavigationToolsProvider,
  ViewerPerformance,
  ViewerStatusbarItemsProvider,
} from "@itwin/web-viewer-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { history } from "./history";


//#region START EDITS - Imports

import { GroupingMappingProvider } from "@itwin/grouping-mapping-widget";
import { MappingsClient } from "@itwin/insights-client";
import { IModelsOdataClient } from "./contexts/imodels-odata-client/IModelsOdataClient";
import { InsightsClientsContext } from "./contexts/InsightsClientsContext";
import { EnvironmentalImpactWidgetProvider } from "./widgets/environmental-impact/EnvironmentalImpactWidgetProvider";
import { RawODataWidgetProvider } from "./widgets/raw-odata/RawODataWidgetProvider";
import { ProcurementWidgetProvider } from "./widgets/procurement/ProcurementWidgetProvider";

//#endregion

//#region START EDITS - Init Reporting API Clients

const mappingsClient = new MappingsClient();
const iModelsOdataClient = new IModelsOdataClient();
const insightsClients = {
  mappingsClient,
  iModelsOdataClient,
};

//#endregion


const App: React.FC = () => {
  const [iModelId, setIModelId] = useState(process.env.IMJS_IMODEL_ID);
  const [iTwinId, setITwinId] = useState(process.env.IMJS_ITWIN_ID);

  const accessToken = useAccessToken();

  const authClient = useMemo(
    () =>
      new BrowserAuthorizationClient({
        scope: process.env.IMJS_AUTH_CLIENT_SCOPES ?? "",
        clientId: process.env.IMJS_AUTH_CLIENT_CLIENT_ID ?? "",
        redirectUri: process.env.IMJS_AUTH_CLIENT_REDIRECT_URI ?? "",
        postSignoutRedirectUri: process.env.IMJS_AUTH_CLIENT_LOGOUT_URI,
        responseType: "code",
        authority: process.env.IMJS_AUTH_AUTHORITY,
      }),
    []
  );

  const login = useCallback(async () => {
    try {
      await authClient.signInSilent();
    } catch {
      await authClient.signIn();
    }
  }, [authClient]);

  useEffect(() => {
    void login();
  }, [login]);

  useEffect(() => {
    if (accessToken) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("iTwinId")) {
        setITwinId(urlParams.get("iTwinId") as string);
      } else {
        if (!process.env.IMJS_ITWIN_ID) {
          throw new Error(
            "Please add a valid iTwin ID in the .env file and restart the application or add it to the iTwinId query parameter in the url and refresh the page. See the README for more information."
          );
        }
      }

      if (urlParams.has("iModelId")) {
        setIModelId(urlParams.get("iModelId") as string);
      } else {
        if (!process.env.IMJS_IMODEL_ID) {
          throw new Error(
            "Please add a valid iModel ID in the .env file and restart the application or add it to the iModelId query parameter in the url and refresh the page. See the README for more information."
          );
        }
      }
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && iTwinId && iModelId) {
      history.push(`?iTwinId=${iTwinId}&iModelId=${iModelId}`);
    }
  }, [accessToken, iTwinId, iModelId]);

  /** NOTE: This function will execute the "Fit View" tool after the iModel is loaded into the Viewer.
   * This will provide an "optimal" view of the model. However, it will override any default views that are
   * stored in the iModel. Delete this function and the prop that it is passed to if you prefer
   * to honor default views when they are present instead (the Viewer will still apply a similar function to iModels that do not have a default view).
   */
  const viewConfiguration = useCallback((viewPort: ScreenViewport) => {
    // default execute the fitview tool and use the iso standard view after tile trees are loaded
    const tileTreesLoaded = () => {
      return new Promise((resolve, reject) => {
        const start = new Date();
        const intvl = setInterval(() => {
          if (viewPort.areAllTileTreesLoaded) {
            ViewerPerformance.addMark("TilesLoaded");
            void ViewerPerformance.addMeasure(
              "TileTreesLoaded",
              "ViewerStarting",
              "TilesLoaded"
            );
            clearInterval(intvl);
            resolve(true);
          }
          const now = new Date();
          // after 20 seconds, stop waiting and fit the view
          if (now.getTime() - start.getTime() > 20000) {
            reject();
          }
        }, 100);
      });
    };

    tileTreesLoaded().finally(() => {
      void IModelApp.tools.run(FitViewTool.toolId, viewPort, true, false);
      viewPort.view.setStandardRotation(StandardViewId.Iso);
    });
  }, []);

  const viewCreatorOptions = useMemo(
    () => ({ viewportConfigurer: viewConfiguration }),
    [viewConfiguration]
  );

  const onIModelAppInit = useCallback(async () => {
    await TreeWidget.initialize();
    await PropertyGridManager.initialize();
    await MeasureTools.startup();
  }, []);

  return (
    <div className="viewer-container">
      {!accessToken && (
        <FillCentered>
          <div className="signin-content">
            <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
          </div>
        </FillCentered>
      )}

      {/* #region START EDITS - Viewer Component Modifications */}

      {/* Here we inject the InsightsClientsContext Provider to give access to the Reporting API client to our widgets. */}
      <InsightsClientsContext.Provider value={insightsClients}>
        <Viewer
          iTwinId={iTwinId ?? ""}
          iModelId={iModelId ?? ""}
          authClient={authClient}
          viewCreatorOptions={viewCreatorOptions}
          enablePerformanceMonitors={true} // see description in the README (https://www.npmjs.com/package/@itwin/web-viewer-react)
          onIModelAppInit={onIModelAppInit}
          uiProviders={[
            new ViewerNavigationToolsProvider(),
            new ViewerContentToolsProvider({
              vertical: {
                measureGroup: false,
              },
            }),
            new ViewerStatusbarItemsProvider(),
            new TreeWidgetUiItemsProvider(),
            new PropertyGridUiItemsProvider({
              enableCopyingPropertyText: true,
            }),
            new MeasureToolsUiItemsProvider(),

            // Add the GroupingMappingWidget, ProcurementWidget, EnvironmentalImpactWidget, and RawODataWidget to the Viewer here.
            new GroupingMappingProvider(),
            new ProcurementWidgetProvider(),
            new EnvironmentalImpactWidgetProvider(),
            new RawODataWidgetProvider(),
          ]}
        />
      </InsightsClientsContext.Provider>

      {/* #endregion */}

    </div>
  );
};

export default App;
