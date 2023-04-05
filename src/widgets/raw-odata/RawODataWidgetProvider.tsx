/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { CommonWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@itwin/appui-react";
import RawODataWidget from "./RawODataWidget";

export class RawODataWidgetProvider implements UiItemsProvider {
  public readonly id: string = "RawODataWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    _location: StagePanelLocation,
    _section?: StagePanelSection | undefined,
  ): readonly CommonWidgetProps[] {
    const widgets: CommonWidgetProps[] = [];

    if (_location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      const rawODataWidget: CommonWidgetProps = {
        id: "RawODataWidget",
        label: "Raw OData",
        getWidgetContent: () => {
          return <RawODataWidget />;
        }
      }
      widgets.push(rawODataWidget);
    }
    return widgets;
  }
}