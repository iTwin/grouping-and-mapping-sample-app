/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { QuantityType } from "@itwin/insights-client";

/** Helper function to round to 3 decimal places. */
export const roundTo3 = (val: number) => {
  return Math.round(val * 1000) / 1000;
};

/** Helper function to round QuantityTypes to SI display units. */
export const quantityTypeToDisplayUnits = (quantityType: QuantityType) => {
  switch(quantityType) {
    case QuantityType.Area:
      return "m\u00B2";
    case QuantityType.Distance:
      return "m";
    case QuantityType.Force:
      return "kg\u22C5m/s\u00B2";
    case QuantityType.Mass:
      return "kg";
    case QuantityType.Monetary:
      return "$";
    case QuantityType.Time:
      return "s";
    case QuantityType.Volume:
      return "m\u00B3";
    default:
      return undefined;
  }
};