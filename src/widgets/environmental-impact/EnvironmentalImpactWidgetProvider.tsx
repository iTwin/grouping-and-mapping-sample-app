/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { CommonWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@itwin/appui-react";
import EnvironmentalImpactWidget from "./EnvironmentalImpactWidget";

export class EnvironmentalImpactWidgetProvider implements UiItemsProvider {
  public readonly id: string = "EnvironmentalImpactWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    _location: StagePanelLocation,
    _section?: StagePanelSection | undefined,
  ): readonly CommonWidgetProps[] {
    const widgets: CommonWidgetProps[] = [];

    if (_location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      const environmentalWidget: CommonWidgetProps = {
        id: "EnvironmentalImpactWidget",
        label: "Environmental Impact",
        getWidgetContent: () => {
          return <EnvironmentalImpactWidget />;
        }
      }
      widgets.push(environmentalWidget);
    }
    return widgets;
  }
}
