/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { StagePanelLocation, StagePanelSection, UiItemsProvider, Widget } from "@itwin/appui-react";
import ProcurementWidget from "./ProcurementWidget";

export class ProcurementWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ProcurementWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    section?: StagePanelSection | undefined,
  ): readonly Widget[] {
    const widgets: Widget[] = [];

    if (location === StagePanelLocation.Bottom && section === StagePanelSection.Start) {
      const procurementWidget: Widget = {
        id: "ProcurementWidget",
        label: "Procurement",
        content: <ProcurementWidget />,
      }
      widgets.push(procurementWidget);
    }
    return widgets;
  }
}
