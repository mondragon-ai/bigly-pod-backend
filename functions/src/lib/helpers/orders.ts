import {shopifyRequest} from "../../networking/shopify";
import {Address} from "../types/shopify/orders";

/**
 * Creates a POD (Print-on-Demand) order on Shopify.
 *
 * @param {Object} shopify_order_payload - The Shopify order payload to create a POD order.
 * @param {Array<{ variant_id: string; quantity: string }>} shopify_order_payload.line_items - The line items for the order.
 * @param {string} shopify_order_payload.currency - The currency for the order.
 * @param {string} shopify_order_payload.financial_status - The financial status of the order.
 * @param {Object} shopify_order_payload.customer - The customer information for the order.
 * @param {number} shopify_order_payload.customer.id - The customer ID.
 * @param {string} shopify_order_payload.tags - The tags for the order.
 * @param {Array<{ custom: boolean; price: string; title: string }>} shopify_order_payload.shipping_lines - The shipping lines for the order.
 * @param {Address} shopify_order_payload.shipping_address - The shipping address for the order.
 * @returns {Promise<any | null>} A promise that resolves to the created POD order or null if the creation fails.
 */
export const createPODOrder = async (shopify_order_payload: {
  line_items: {variant_id: string; quantity: string}[];
  currency: string;
  financial_status: string;
  customer: {id: number};
  tags: string;
  shipping_lines: {
    custom: boolean;
    price: string;
    title: string;
  }[];
  shipping_address: Address;
}): Promise<any | null> => {
  const SHOPIFY_BIGLY_POD = process.env.SHOPIFY_BIGLY_POD || "";
  const pod_order = await shopifyRequest(
    "orders.json",
    "POST",
    {order: shopify_order_payload},
    SHOPIFY_BIGLY_POD,
    "bigly-pod",
  );

  return pod_order || null;
};
