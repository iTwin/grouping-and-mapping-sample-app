/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import type { PagedResponseLinks } from "../interfaces/Links";

export interface Collection<TEntity> {
  values: Array<TEntity>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _links: PagedResponseLinks;
}

export interface EntityCollectionPage<TEntity> {
  /** Current page entities. */
  entities: TEntity[];
  /** Function to retrieve the next page of the entities. If `undefined` the current page is last. */
  next?: () => Promise<EntityCollectionPage<TEntity>>;
}

export type EntityPageQueryFunc<TEntity> = () => Promise<EntityCollectionPage<TEntity>>;

export async function* flatten<TEntity>(pagedIterator: AsyncIterableIterator<TEntity[]>): AsyncIterableIterator<TEntity> {
  for await (const entityChunk of pagedIterator) {
    for (const entity of entityChunk) {
      yield entity;
    }
  }
}

export async function getEntityCollectionPage<TEntity>(
  nextUrl: string,
  getNextBatch: (url: string) => Promise<Collection<TEntity>>
): Promise<EntityCollectionPage<TEntity>> {
  const response: Collection<TEntity> = await getNextBatch(nextUrl);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const nextLink = response._links.next;
  return {
    entities: response.values,
    next: nextLink ? async () => getEntityCollectionPage<TEntity>(nextLink.href, getNextBatch) : undefined,
  };
}

/**
 * Loads all entities from an iterator into an array.
 * @param {AsyncIterableIterator<TEntity>} iterator entity iterator.
 * @returns {Promise<TEntity[]>} entity array.
 */
export async function toArray<TEntity>(iterator: AsyncIterableIterator<TEntity>): Promise<TEntity[]> {
  const result: TEntity[] = [];
  for await (const entity of iterator) {
    result.push(entity);
  }
  return result;
}