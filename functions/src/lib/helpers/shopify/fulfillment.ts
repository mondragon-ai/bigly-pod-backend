import {shopifyRequest} from "../../../networking/shopify";
import * as functions from "firebase-functions";
import {
  FulfillmentOrderResponse,
  FulfillmentServiceResponse,
  ShopifyFSResponse,
} from "../../types/shopify/fulfillment";

type FulfillmentServiceInfo = {
  location_id: number;
  id: number;
};

export const getFulfillmentOrder = async (
  order_id: number | string,
  access_token: string,
  shop: string,
): Promise<FulfillmentOrderResponse> => {
  const fulfillment = (await shopifyRequest(
    `orders/${order_id}/fulfillment_orders.json`,
    "GET",
    null,
    access_token,
    shop,
  )) as FulfillmentOrderResponse;

  return fulfillment;
};

/**
 * Creates a fulfillment service in the Shopify store with the provided shop and access token.
 *
 * @param {string} shop - The Shopify store's domain.
 * @param {string} accessToken - The access token for Shopify API.
 * @returns {Promise<FulfillmentServiceInfo>} A promise that resolves to information about the created fulfillment service.
 * @throws {Error} If there is an error during the fulfillment service creation process.
 */
export const createFulfillmentService = async (
  shop: string,
  accessToken: string,
): Promise<FulfillmentServiceInfo> => {
  try {
    const fulfillmentData = await initializeFulfillmentService(
      shop,
      accessToken,
    );

    if (!fulfillmentData) {
      const existingService = await findExistingFulfillmentService(
        shop,
        accessToken,
      );
      // logError(fulfillmentData.errors.name[0]);

      return {
        location_id: existingService.location_id || 0,
        id: existingService.id || 0,
      };
    }

    return {
      location_id: fulfillmentData.fulfillment_service.location_id,
      id: fulfillmentData.fulfillment_service.id,
    };
  } catch (error) {
    logError(`Failed to create fulfillment service: ${error}`);
    throw new Error(`Failed to create fulfillment service: ${error}`);
  }
};

/**
 * Initializes the fulfillment service by sending a request to Shopify API.
 *
 * @param {string} shop - The Shopify store's domain.
 * @param {string} accessToken - The access token for Shopify API.
 * @returns {Promise<FulfillmentServiceResponse>} A promise that resolves to the Shopify API response.
 */
const initializeFulfillmentService = async (
  shop: string,
  accessToken: string,
): Promise<FulfillmentServiceResponse> => {
  const data = {
    fulfillment_service: {
      name: "BiglyPOD Solutions",
      callback_url:
        "https://us-central1-only-caps.cloudfunctions.net/fulfillment/fulfillment_order_notification",
      inventory_management: false,
      permits_sku_sharing: true,
      fulfillment_orders_opt_in: true,
      tracking_support: true,
      requires_shipping_method: true,
      format: "json",
    },
  };

  return (await shopifyRequest(
    "fulfillment_services.json",
    "POST",
    data,
    accessToken,
    shop,
  )) as FulfillmentServiceResponse;
};

/**
 * Finds an existing fulfillment service in the Shopify store by name.
 *
 * @param {string} shop - The Shopify store's domain.
 * @param {string} accessToken - The access token for Shopify API.
 * @returns {Promise<FulfillmentServiceInfo>} A promise that resolves to the fulfillment service information.
 */
const findExistingFulfillmentService = async (
  shop: string,
  accessToken: string,
): Promise<FulfillmentServiceInfo> => {
  const response = (await shopifyRequest(
    "fulfillment_services.json?scope=all",
    "GET",
    null,
    accessToken,
    shop,
  )) as ShopifyFSResponse;

  const service = response.fulfillment_services?.find(
    (f) => f.name === "BiglyPOD Solutions",
  );

  return {
    location_id: service?.location_id || 0,
    id: service?.id || 0,
  };
};

/**
 * Logs errors using Firebase Functions logger.
 *
 * @param {any} error - The error object to log.
 */
const logError = (error: string) => {
  functions.logger.warn({error});
};
