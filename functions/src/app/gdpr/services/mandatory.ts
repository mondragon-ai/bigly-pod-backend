import * as functions from "firebase-functions";
import {verifyShopifyWebhook} from "../../../lib/helpers/mandatory";

/**
 * Redacts store data based on the provided buffer and HMAC header.
 *
 * @param {Buffer} data - The buffer containing the Shopify webhook data.
 * @param {string} hmacHeader - The HMAC header used to verify the authenticity of the webhook.
 * @returns {Promise<number>} The HTTP status code indicating the result of the operation.
 */
export const redactStore = async (
  data: Buffer,
  hmacHeader: string,
): Promise<number> => {
  functions.logger.info({hmacHeader, data});
  if (!hmacHeader || !data) {
    functions.logger.error(" 🚨 [ERROR]: No Data - 404 Status. ");
    return 404;
  }

  try {
    const verified = verifyShopifyWebhook(data, hmacHeader as string);
    if (!verified) {
      functions.logger.error(" 🚨 [ERROR]: Unauthorized - 401 Status. ");
      return 401;
    }
  } catch (error) {
    functions.logger.error("CATCH: ", {error});
    return 500;
  }

  // TODO: Delete Store Data

  return 200;
};

/**
 * Redacts customer data based on the provided buffer and HMAC header.
 *
 * @param {Buffer} data - The buffer containing the Shopify webhook data.
 * @param {string} hmacHeader - The HMAC header used to verify the authenticity of the webhook.
 * @returns {Promise<number>} The HTTP status code indicating the result of the operation.
 */
export const redactCustomer = async (
  data: Buffer,
  hmacHeader: string,
): Promise<number> => {
  functions.logger.info({hmacHeader, data});
  if (!hmacHeader || !data) {
    functions.logger.error(" 🚨 [ERROR]: No Data - 404 Status. ");
    return 404;
  }

  try {
    const verified = verifyShopifyWebhook(data, hmacHeader as string);
    if (!verified) {
      functions.logger.error(" 🚨 [ERROR]: Unauthorized - 401 Status. ");
      return 401;
    }
  } catch (error) {
    functions.logger.error("CATCH: ", {error});
    return 500;
  }

  // TODO: Delete Customer Data
  // Orders w/ ID || email

  return 200;
};

/**
 * Requests customer data based on the provided buffer and HMAC header.
 *
 * @param {Buffer} data - The buffer containing the Shopify webhook data.
 * @param {string} hmacHeader - The HMAC header used to verify the authenticity of the webhook.
 * @returns {Promise<{status: number, customer: string[] | null}>} An object containing the HTTP status code and the customer data.
 */
export const requestCustomerData = async (
  data: Buffer,
  hmacHeader: string,
): Promise<{status: number; customer: string[] | null}> => {
  functions.logger.info({hmacHeader, data});
  if (!hmacHeader || !data) {
    functions.logger.error(" 🚨 [ERROR]: No Data - 404 Status. ");
    return {status: 404, customer: null};
  }

  try {
    const verified = verifyShopifyWebhook(data, hmacHeader as string);
    if (!verified) {
      functions.logger.error(" 🚨 [ERROR]: Unauthorized - 401 Status. ");
      return {status: 401, customer: null};
    }
  } catch (error) {
    functions.logger.error("CATCH: ", {error});
    return {status: 500, customer: null};
  }

  // TODO: Return Customer Data (order list)
  // Orders w/ ID || email

  return {status: 200, customer: [] as string[]};
};
