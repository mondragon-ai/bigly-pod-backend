import {shopifyGraphQlRequest, shopifyRequest} from "../../networking/shopify";
import {ShopifyPubSubOrder} from "../types/shopify/orders";
import {decryptMsg} from "../../utils/encryption";
import {OrderDocument} from "../types/orders";
import {
  FulfillmentOrderResponse,
  ShopifyFulfillment,
} from "../types/shopify/fulfillment";
import {
  acceptFulfillmentRequest,
  sendFulfillmentRequest,
} from "../../app/fulfillment/services/fulfillment";

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
): Promise<{tracking: string; fulfillment_order_id: string}> => {
  const shop = domain.split(".")[0];
  const token = await decryptMsg(merchant_order.access_token);
  const tracking = order.fulfillments[0]?.tracking_url || "";

  const fulfillment_order_id = await getFulfillmentID(
    merchant_order_id,
    Number(merchant_order.location_id),
    shop,
    token,
  );

  if (fulfillment_order_id === "") {
    return {tracking: tracking, fulfillment_order_id: ""};
  }

  const fulfillment_id = await fulfillShopifyOrder(
    fulfillment_order_id,
    Number(merchant_order.location_id),
    shop,
    token,
  );

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

  return {tracking: tracking, fulfillment_order_id: fulfillment_order_id};
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

  let fulfillment_id = "";
  const fulfillmentOrder = fulfillment.fulfillment_orders.filter(
    (order) => order.assigned_location_id === location_id,
  );

  if (!fulfillmentOrder || fulfillmentOrder.length == 0) {
    return fulfillment_id;
  }

  const last_fulfillment = fulfillmentOrder[fulfillmentOrder.length - 1];
  fulfillment_id = String(last_fulfillment.id);

  if (last_fulfillment.request_status == "submitted") {
    await acceptFulfillmentRequest(fulfillment_id, access_token, shop);
  }

  if (last_fulfillment.request_status == "unsubmitted") {
    await sendFulfillmentRequest(fulfillment_id, access_token, shop);
    await acceptFulfillmentRequest(fulfillment_id, access_token, shop);
  }

  if (last_fulfillment.request_status == "cancellation_requested") {
    await fulfillmentOrderAcceptCancellationRequest(
      shop,
      access_token,
      fulfillment_id,
    );
    fulfillment_id = "";
  }

  return fulfillment_id;
};

export const fulfillmentOrderAcceptCancellationRequest = async (
  shop: string,
  token: string,
  fulfillment_id: string,
) => {
  const acceptCancellation = {
    query: `
      mutation fulfillmentOrderAcceptCancellationRequest($id: ID!) {
        fulfillmentOrderAcceptCancellationRequest(id: $id) {
          fulfillmentOrder {
            id
            status
            requestStatus
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      id: `gid://shopify/FulfillmentOrder/${fulfillment_id}`,
    },
  };

  shopifyGraphQlRequest(shop, token, acceptCancellation);
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

  return fulfillments &&
    Number(fulfillments.fulfillment.location_id) === location_id
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
