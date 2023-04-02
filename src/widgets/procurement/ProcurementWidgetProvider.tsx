/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AbstractWidgetProps, AbstractZoneLocation, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@itwin/appui-abstract";
import ProcurementWidget from "./ProcurementWidget";

export class ProcurementWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ProcurementWidgetProvider";

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
      const procurementWidget: AbstractWidgetProps = {
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
