/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/**
 * Hyperlink container.
 * @export
 * @interface Link
 */
export interface Link {
  /**
   * Hyperlink to the specific entity.
   * @type {string}
   * @memberof Link
   */
  href: string;
}

/**
 * URLs for redoing the current request and/or getting the next page of results if applicable.
 * @export
 * @interface PagedResponseLinks
 */
export interface PagedResponseLinks {
  /**
   *
   * @type {Link}
   * @memberof PagedResponseLinks
   */
  next?: Link;
  /**
   *
   * @type {Link}
   * @memberof PagedResponseLinks
   */
  self: Link;
}