import * as functions from "firebase-functions";
import {OrderDocument} from "../lib/types/orders";
import {fetchMerchant} from "../lib/helpers/merchant";
import {findVariantsInDB} from "../lib/helpers/variants";
import {createOrderPayload} from "../lib/payloads/orders";
import {ShopifyPubSubOrder} from "../lib/types/shopify/orders";
import {generateShippingRates} from "../lib/helpers/shipengine";
import {createShopifyCustomer} from "../lib/helpers/shopify/customers";
import {
  createSubcollectionDocument,
  fetchSubcollectionDocument,
} from "../database/firestore";

/**
 * Handles the completion of an order via Pub/Sub message.
 *
 * @param {functions.pubsub.Message} message - The Pub/Sub message containing order information.
 * @returns {Promise<null>} A promise that resolves to `null`.
 */
export const orderCompletePubSub = async (
  message: functions.pubsub.Message,
): Promise<OrderDocument | null> => {
  try {
    // Extract Data from Order
    const order = message.json as ShopifyPubSubOrder;
    const {id, order_status_url, line_items, shipping_address, email} = order;

    // Fetch Merchant & domain
    const {domain, merchant} = await fetchMerchant(order_status_url);
    functions.logger.warn(`💳 [PUBSUB] - Order complete: ${domain}`);
    if (!domain || !merchant) {
      functions.logger.error("[ERROR]: Merchant not found");
      return null;
    }

    // Check if order already exists
    const {data: MerchantOrder} = await fetchSubcollectionDocument(
      "shopify_pod",
      domain,
      "orders",
      String(id),
    );

    if (MerchantOrder) {
      functions.logger.warn("[WARN]: Order already created");
      return null;
    }

    // Find Product Variants in DB
    const pod_line_items = await findVariantsInDB(domain, line_items);

    // If no variants found, exit early
    if (pod_line_items.length === 0 || !merchant) return null;

    // Create or Fetch Shopify Customer ID using email
    const customer = await createShopifyCustomer(shipping_address, email);

    // Generate Shipping Rate
    const shipping_rate = await generateShippingRates(
      shipping_address,
      pod_line_items,
    );

    // Create Order Payload
    const payload = createOrderPayload(
      order,
      domain,
      merchant,
      pod_line_items,
      customer,
      shipping_rate,
    );

    if (!payload) {
      functions.logger.error("ERROR: Payload doesn't exist");
      return null;
    }

    // Save Order
    await createSubcollectionDocument(
      "shopify_pod",
      domain,
      "orders",
      String(id),
      payload,
    );

    return payload;
  } catch (error) {
    functions.logger.error("Error in orderCompletePubSub:", error);
    return null;
  }
};

const settings: functions.RuntimeOptions = {
  timeoutSeconds: 120,
};

export const orderComplete = functions
  .runWith(settings)
  .pubsub.topic("pod-order-complete")
  .onPublish(async (message) => {
    const resoponse = await orderCompletePubSub(message);
    if (!resoponse) return;
  });
