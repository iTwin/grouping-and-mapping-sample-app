/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ViewChangeOptions } from "@itwin/core-frontend";
import { IModelApp } from "@itwin/core-frontend";
import { QueryBinder, QueryRowFormat } from "@itwin/core-common";
import type { InstanceKey } from "@itwin/presentation-common";
import { KeySet } from "@itwin/presentation-common";
import { HiliteSetProvider } from "@itwin/presentation-frontend";

/** Helper function that abstracts away zoom options for convenience. */
export const zoomToElements = async (elementIds: string[]) => {
  const vp = IModelApp.viewManager.selectedView;
  if (!vp || elementIds.length === 0) {
    return;
  }

  const viewChangeOpts: ViewChangeOptions = {};
  viewChangeOpts.animateFrustumChange = true;
  // It was removed. Should be a prop to be passed to lookAtViewAlignedVolume within the implementation.
  // viewChangeOpts.marginPercent = new MarginPercent(0.1, 0.1, 0.1, 0.1);
  await vp.zoomToElements(elementIds, { ...viewChangeOpts });
};

/** Often a list of ECInstanceIds does not directly match the ids of the elements drawn in the 3D viewer.
 *   To be safe, in all cases before sending recoloring, or zoom commands to the viewer, one should fetch
 *   the HiliteSet - the resolved ECInstanceIds of the elements drawn in the viewer - and use that for 
 *   coloring, zooming, etc.
 */
export const getHiliteIds = async (
  elementIds: string[],
) => {
  const vp = IModelApp.viewManager.selectedView;
  if (!vp) {
    return [];
  }

  const keySet = await manufactureKeys(elementIds);
  const hiliteProvider: HiliteSetProvider = HiliteSetProvider.create({
    imodel: vp.iModel,
  });
  const set = await hiliteProvider.getHiliteSet(keySet);
  if (set.elements) {
    return [...set.elements];
  }
  return [];
};

/** A helper function for getting a HiliteSet. */
export const manufactureKeys = async (
  elementIds: string[],
): Promise<KeySet> => {
  const vp = IModelApp.viewManager.selectedView;
  if (!vp || elementIds.length === 0) {
    return new KeySet();
  }

  const batchSize = 1000;
  const batches: AsyncIterableIterator<any>[] = [];
  const iModelConnection = vp.iModel;
  
  for (let i = 0; i < elementIds.length; i += batchSize) {
    const batchIds = elementIds.slice(i, i + batchSize);
    const params = batchIds.map((_) => "?").join(",");
    const query = `SELECT ECInstanceId, ec_classname(ECClassId) from BisCore.Element WHERE ECInstanceId IN (${params})`;
    batches.push(
      iModelConnection.query(query, QueryBinder.from(batchIds), {
        rowFormat: QueryRowFormat.UseECSqlPropertyIndexes
      })
    );
  }

  const keys: InstanceKey[] = [];
  for (const batch of batches) {
    for await (const row of batch) {
      keys.push({ id: row[0], className: row[1] });
    }
  }

  return new KeySet(keys);
};