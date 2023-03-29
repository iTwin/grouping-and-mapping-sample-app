/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "./GradientLegend.scss";

import { QuantityType } from "@itwin/insights-client";
import { Fieldset } from "@itwin/itwinui-react";
import { quantityTypeToDisplayUnits, roundTo3 } from "../shared/dataUtils";

interface LinearGradientProps {
  title?: string;
  minVal: number;
  maxVal: number;
  quantityType: QuantityType;
}

/** Renders a legend showing blue was the `minVal` and red as the `maxVal`. */
const GradientLegend = ({ minVal, maxVal, quantityType, title }: LinearGradientProps) => {
  return (
    <Fieldset legend={"Legend" + (title ? `: ${title}`:"") + ` (${quantityTypeToDisplayUnits(quantityType) ?? "units"})`} className="gradient-window">
      <div className="gradient">
        <div className="gradient-label gradient-label-min">
          { roundTo3(minVal) }
        </div>
        <div className="gradient-label gradient-label-max">
          { roundTo3(maxVal) }
        </div>
        <div className="gradient-label-axis"></div>
      </div>
    </Fieldset>
  );
};

export default GradientLegend;