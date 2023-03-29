/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/**
 * Contains error information.
 * @export
 * @interface ErrorDetails
 */
 export interface ErrorDetails {
  /**
   * One of a server-defined set of error codes.
   * @type {string}
   * @memberof ErrorDetails
   */
  code: string;
  /**
   * A human-readable representation of the error.
   * @type {string}
   * @memberof ErrorDetails
   */
  message: string;
}

/**
 * Gives details for an error that occurred while handling the request.
 * @export
 * @interface ErrorResponse
 */
export interface ErrorResponse {
  /**
   *
   * @type {Error}
   * @memberof ErrorResponse
   */
  error: ModelError;
}

/**
* Contains error information and an optional array of more specific errors.
* @export
* @interface ModelError
*/
export interface ModelError {
  /**
   * One of a server-defined set of error codes.
   * @type {string}
   * @memberof ModelError
   */
  code: string;
  /**
   * A human-readable representation of the error.
   * @type {string}
   * @memberof ModelError
   */
  message: string;
  /**
   * Optional array of more specific errors.
   * @type {Array<ErrorDetails>}
   * @memberof ModelError
   */
  details?: Array<ErrorDetails>;
}

export class RequiredError extends Error {
  constructor(public field: string, msg?: string) {
    super(msg);
  }
}