/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AbstractWidgetProps, AbstractZoneLocation, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@itwin/appui-abstract";
import RawODataWidget from "./RawODataWidget";

export class RawODataWidgetProvider implements UiItemsProvider {
  public readonly id: string = "RawODataWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    _location: StagePanelLocation,
    _section?: StagePanelSection | undefined,
    _zoneLocation?: AbstractZoneLocation | undefined,
    _stageAppData?: any,
  ): readonly AbstractWidgetProps[] {
    const widgets: AbstractWidgetProps[] = [];

    if (_location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      const rawODataWidget: AbstractWidgetProps = {
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