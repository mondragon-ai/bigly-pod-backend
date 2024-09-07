import * as functions from "firebase-functions";
import {shopifyRequest} from "../../../networking/shopify";
import {getFulfillmentOrder} from "../../../lib/helpers/shopify/fulfillment";

/**
 * Logs and handles errors in a consistent way.
 *
 * @param {Error} error - The error object.
 * @param {string} message - Custom error message to log.
 */
export const handleError = (error: Error | null, message: string): null => {
  functions.logger.error(message, error);
  return null;
};

/**
 * Handles POD (Print-on-Demand) order fulfillment for a specific order.
 *
 * @param {string | number} order_id - The ID of the order to fulfill.
 * @param {string} access_token - The access token for Shopify API.
 * @param {string} shop - The Shopify shop name.
 * @param {string | number} location_id - The location ID for the fulfillment.
 * @returns {Promise<string | null>} A promise that resolves to the fulfillment ID or null.
 */
export const handlePODFulfillment = async (
  order_id: string | number,
  access_token: string,
  shop: string,
  location_id: string | number,
): Promise<string | null> => {
  try {
    const fulfillment = await getFulfillmentOrder(order_id, access_token, shop);
    if (!fulfillment) {
      handleError(null, "Error occurred during fulfillment request.");
    }

    for (const full of fulfillment.fulfillment_orders) {
      if (Number(full.assigned_location_id) === Number(location_id)) {
        try {
          await sendFulfillmentRequest(full.id, access_token, shop);
          await acceptFulfillmentRequest(full.id, access_token, shop);
          return String(full.id);
        } catch (error) {
          handleError(
            error as Error,
            "Error occurred during fulfillment request.",
          );
        }
      }
    }
    return null;
  } catch (error) {
    handleError(error as Error, "Failed to fetch fulfillment orders.");
  }
  return null;
};

/**
 * Sends a fulfillment request for a specific fulfillment order.
 *
 * @param {string | number} fulfillment_id - The ID of the fulfillment order.
 * @param {string} access_token - The access token for Shopify API.
 * @param {string} shop - The Shopify shop name.
 * @returns {Promise<void>} A promise that resolves when the request is sent.
 */
export const sendFulfillmentRequest = async (
  fulfillment_id: string | number,
  access_token: string,
  shop: string,
): Promise<void> => {
  await shopifyRequest(
    `fulfillment_orders/${fulfillment_id}/fulfillment_request.json`,
    "POST",
    {fulfillment_request: {message: "Fulfill this ASAP please."}},
    access_token,
    shop,
  );
};

/**
 * Accepts a fulfillment request for a specific fulfillment order.
 *
 * @param {string | number} fulfillment_id - The ID of the fulfillment order.
 * @param {string} access_token - The access token for Shopify API.
 * @param {string} shop - The Shopify shop name.
 * @returns {Promise<void>} A promise that resolves when the request is accepted.
 */
export const acceptFulfillmentRequest = async (
  fulfillment_id: string | number,
  access_token: string,
  shop: string,
): Promise<void> => {
  await shopifyRequest(
    `fulfillment_orders/${fulfillment_id}/fulfillment_request/accept.json`,
    "POST",
    {
      fulfillment_request: {
        message:
          "We are fulfilling asap. Give us 3-10 business days to produce and ship.",
      },
    },
    access_token,
    shop,
  );
};
