/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { StagePanelLocation, StagePanelSection, UiItemsProvider, Widget } from "@itwin/appui-react";
import RawODataWidget from "./RawODataWidget";

export class RawODataWidgetProvider implements UiItemsProvider {
  public readonly id: string = "RawODataWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    section?: StagePanelSection | undefined,
  ): readonly Widget[] {
    const widgets: Widget[] = [];

    if (location === StagePanelLocation.Bottom && section === StagePanelSection.Start) {
      const rawODataWidget: Widget = {
        id: "RawODataWidget",
        label: "Raw OData",
        content: <RawODataWidget />,
      }
      widgets.push(rawODataWidget);
    }
    return widgets;
  }
}