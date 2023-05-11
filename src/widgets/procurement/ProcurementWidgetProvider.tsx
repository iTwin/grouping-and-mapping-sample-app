/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { CommonWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@itwin/appui-react";
import ProcurementWidget from "./ProcurementWidget";

export class ProcurementWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ProcurementWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    section?: StagePanelSection | undefined,
  ): readonly CommonWidgetProps[] {
    const widgets: CommonWidgetProps[] = [];

    if (location === StagePanelLocation.Bottom && section === StagePanelSection.Start) {
      const procurementWidget: CommonWidgetProps = {
        id: "ProcurementWidget",
        label: "Procurement",
        getWidgetContent: () => {
          return <ProcurementWidget />;
        }
      }
      widgets.push(procurementWidget);
    }
    return widgets;
  }
}
