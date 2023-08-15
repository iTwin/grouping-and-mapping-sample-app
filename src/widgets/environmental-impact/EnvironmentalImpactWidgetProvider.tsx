/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { StagePanelLocation, StagePanelSection, UiItemsProvider, Widget } from "@itwin/appui-react";
import EnvironmentalImpactWidget from "./EnvironmentalImpactWidget";

export class EnvironmentalImpactWidgetProvider implements UiItemsProvider {
  public readonly id: string = "EnvironmentalImpactWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    section?: StagePanelSection | undefined,
  ): readonly Widget[] {
    const widgets: Widget[] = [];

    if (location === StagePanelLocation.Bottom && section === StagePanelSection.Start) {
      const environmentalWidget: Widget = {
        id: "EnvironmentalImpactWidget",
        label: "Environmental Impact",
        content: <EnvironmentalImpactWidget />,
      }
      widgets.push(environmentalWidget);
    }
    return widgets;
  }
}
