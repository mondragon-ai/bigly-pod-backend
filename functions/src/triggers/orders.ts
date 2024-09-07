import {decryptMsg} from "../utils/encryption";
import * as functions from "firebase-functions";
import {OrderDocument} from "../lib/types/orders";
import {createPODOrder} from "../lib/helpers/orders";
import {updateMerchantUsage} from "../lib/helpers/billing";
import {updateSubcollectionDocument} from "../database/firestore";
import {handlePODFulfillment} from "../app/fulfillment/services/fulfillment";
import {
  updateDailyAnalytics,
  updateMonthlyAnalytics,
} from "../lib/helpers/analytics";

/**
 * Firestore onCreate trigger for Shopify orders.
 *
 * @param {functions.firestore.DocumentSnapshot} snap - The Firestore snapshot of the created document.
 * @param {functions.EventContext} context - The event context.
 * @returns {Promise<null>} A promise that resolves to `null`.
 */
export const orderCreated = functions.firestore
  .document("/shopify_pod/{merchant}/orders/{ordersID}")
  .onCreate(async (snap) => {
    try {
      const order: OrderDocument = snap.data() as OrderDocument;
      const {
        id,
        domain,
        access_token,
        pod_line_items,
        myshopify_domain,
        shipping_rate,
        shopify_order_payload,
        merchant_order,
        location_id,
        pod_created,
        is_wholesale,
      } = order;
      if (pod_created) return null;
      functions.logger.warn(
        `🛍️ [DB TRIGGER] - Order Created (Billing/fulfillment): ${
          domain.split(".")[0]
        } ${domain}`,
      );

      // Update Merchant Usage
      const {capacityReached, createdRecord} = await updateMerchantUsage(
        access_token,
        pod_line_items,
        myshopify_domain,
        shipping_rate,
        is_wholesale,
      );
      console.log({capacityReached, createdRecord});
      if (capacityReached || !createdRecord) {
        await updateOrderDocument(domain, id, {
          ...order,
          pod_created: false,
          fulfillment_status: "BILLING",
        });
        return null;
      }

      // Send order to POD
      const pod_order = await createPODOrder(shopify_order_payload);
      if (!pod_order) return null;

      let fulfillment_id = "" as string | null;
      if (!is_wholesale) {
        // Handle Fulfillment
        fulfillment_id = await processFulfillment(
          access_token,
          myshopify_domain,
          String(merchant_order.order_id),
          location_id,
        );
      }

      // Update Order Document
      await updateOrderDocument(domain, id, {
        ...order,
        pod_created: true,
        fulfillment_id: String(fulfillment_id || ""),
      });

      await updateDailyAnalytics(order, domain);
      // console.log({initial_daily: daily_analytics});

      await updateMonthlyAnalytics(order, domain);
      // console.log({initial_monthly: monthly_analytics});

      return null;
    } catch (error) {
      handleError(error as Error, "Error in orderCreated function");
      return null;
    }
  });

/**
 * Processes fulfillment for an order.
 *
 * @param {string} access_token - The access token for Shopify.
 * @param {string} myshopify_domain - The merchant's Shopify domain.
 * @param {string} order_id - The ID of the order.
 * @param {string | number} location_id - The location ID for fulfillment.
 * @returns {Promise<string>} A promise that resolves to the fulfillment ID.
 */
async function processFulfillment(
  access_token: string,
  myshopify_domain: string,
  order_id: string,
  location_id: string | number,
): Promise<string | null> {
  const token = await decryptMsg(access_token);
  const shop = myshopify_domain.split(".")[0];
  return handlePODFulfillment(order_id, token, shop, location_id);
}

/**
 * Updates the order document in Firestore.
 *
 * @param {string} domain - The domain of the Shopify store.
 * @param {string} orderId - The ID of the order.
 * @param {Partial<OrderDocument>} updatedData - The updated order data.
 * @returns {Promise<void>} A promise that resolves when the document is updated.
 */
async function updateOrderDocument(
  domain: string,
  orderId: string,
  updatedData: Partial<OrderDocument>,
): Promise<void> {
  await updateSubcollectionDocument(
    "shopify_pod",
    domain,
    "orders",
    orderId,
    updatedData,
  );
}

/**
 * Handles errors by logging them to Firebase Functions logger.
 *
 * @param {Error} error - The error to handle.
 * @param {string} message - A custom message to log with the error.
 */
function handleError(error: Error, message: string): void {
  functions.logger.error(`${message}: ${error.message}`);
}
