import {ShopifyPubSubOrder} from "../types/shopify/orders";
import {shopifyRequest} from "../../networking/shopify";
import {decryptMsg} from "../../utils/encryption";
import {OrderDocument} from "../types/orders";
import {
  FulfillmentOrderResponse,
  ShopifyFulfillment,
} from "../types/shopify/fulfillment";

/**
 * Handles POD (Print-on-Demand) order fulfillment for a specific merchant order.
 *
 * @param {ShopifyPubSubOrder} order - The Shopify order object.
 * @param {OrderDocument} merchant_order - The merchant's order document.
 * @param {string} domain - The merchant's domain.
 * @param {string} merchant_order_id - The ID of the merchant's order.
 * @returns {Promise<string>} A promise that resolves to the tracking URL if available.
 */
export const handlePODFulfillmentPubSub = async (
  order: ShopifyPubSubOrder,
  merchant_order: OrderDocument,
  domain: string,
  merchant_order_id: string,
): Promise<string> => {
  const shop = domain.split(".")[0];
  const token = await decryptMsg(merchant_order.access_token);

  let fulfillment_order_id = merchant_order.fulfillment_id;
  if (!fulfillment_order_id) {
    fulfillment_order_id = await getFulfillmentID(
      merchant_order_id,
      Number(merchant_order.location_id),
      shop,
      token,
    );
  }

  const fulfillment_id = await fulfillShopifyOrder(
    fulfillment_order_id,
    Number(merchant_order.location_id),
    shop,
    token,
  );

  const tracking = order.fulfillments[0]?.tracking_url || "";
  if (tracking) {
    const {tracking_number, tracking_company, tracking_url} =
      order.fulfillments[0];
    await addTrackingToShopifyOrder(
      fulfillment_id,
      tracking_company,
      tracking_number,
      tracking_url,
      shop,
      token,
    );
  }

  return tracking;
};

/**
 * Retrieves the fulfillment ID for a given order and location.
 *
 * @param {string} order_id - The ID of the order.
 * @param {number} location_id - The ID of the location.
 * @param {string} shop - The Shopify shop name.
 * @param {string} access_token - The Shopify access token.
 * @returns {Promise<string>} A promise that resolves to the fulfillment ID.
 */
export const getFulfillmentID = async (
  order_id: string,
  location_id: number,
  shop: string,
  access_token: string,
): Promise<string> => {
  const fulfillment = (await shopifyRequest(
    `orders/${order_id}/fulfillment_orders.json`,
    "GET",
    null,
    access_token,
    shop,
  )) as FulfillmentOrderResponse;

  const fulfillmentOrder = fulfillment.fulfillment_orders.find(
    (order) => order.assigned_location_id === location_id,
  );

  return fulfillmentOrder ? String(fulfillmentOrder.id) : "";
};

/**
 * Fulfills a Shopify order.
 *
 * @param {string} fulfillment_order_id - The ID of the fulfillment order.
 * @param {number} location_id - The ID of the location.
 * @param {string} shop - The Shopify shop name.
 * @param {string} access_token - The Shopify access token.
 * @returns {Promise<string>} A promise that resolves to the fulfillment ID.
 */
export const fulfillShopifyOrder = async (
  fulfillment_order_id: string,
  location_id: number,
  shop: string,
  access_token: string,
): Promise<string> => {
  const payload = {
    fulfillment: {
      line_items_by_fulfillment_order: [
        {fulfillment_order_id: fulfillment_order_id},
      ],
    },
  };

  const fulfillments = (await shopifyRequest(
    "fulfillments.json",
    "POST",
    payload,
    access_token,
    shop,
  )) as ShopifyFulfillment;

  return Number(fulfillments.fulfillment.location_id) === location_id
    ? String(fulfillments.fulfillment.id)
    : "";
};

/**
 * Adds tracking information to a Shopify order fulfillment.
 *
 * @param {string} fulfillment_id - The ID of the fulfillment.
 * @param {string} company - The tracking company.
 * @param {string} number - The tracking number.
 * @param {string} url - The tracking URL.
 * @param {string} shop - The Shopify shop name.
 * @param {string} access_token - The Shopify access token.
 * @returns {Promise<void>} A promise that resolves when the tracking information is added.
 */
export const addTrackingToShopifyOrder = async (
  fulfillment_id: string,
  company: string,
  number: string,
  url: string,
  shop: string,
  access_token: string,
): Promise<void> => {
  const payload = {
    fulfillment: {
      notify_customer: true,
      tracking_info: {
        company: company,
        number: number,
        url: url,
      },
    },
  };

  await shopifyRequest(
    `fulfillments/${fulfillment_id}/update_tracking.json`,
    "POST",
    payload,
    access_token,
    shop,
  );
};
