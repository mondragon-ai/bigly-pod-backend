import {Status} from "../lib/types/shared";
import * as functions from "firebase-functions";

/**
 * Creates a standardized response object for errors.
 *
 * @param {Status} status - The HTTP status code.
 * @param {string} text - The error message.
 * @returns {{ status: Status; ok: boolean; text: string; product: null; error: true }} - The error response object.
 */
export const createErrorResponse = (
  status: Status,
  text: string,
): {status: Status; ok: boolean; text: string; result: null; error: true} => {
  functions.logger.error(text);
  return {
    status,
    ok: false,
    text,
    result: null,
    error: true,
  };
};
