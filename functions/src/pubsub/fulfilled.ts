import * as functions from "firebase-functions";
import {decodeBase64} from "../utils/encryption";
import {OrderDocument} from "../lib/types/orders";
import {ShopifyPubSubOrder} from "../lib/types/shopify/orders";
import {handlePODFulfillmentPubSub} from "../lib/helpers/fulfillment";
import {
  fetchSubcollectionDocument,
  updateSubcollectionDocument,
} from "../database/firestore";
import {
  updateDailyFulfillAnalytics,
  updateMonthlyFulfillAnalytics,
} from "../lib/helpers/analytics";

const settings: functions.RuntimeOptions = {
  timeoutSeconds: 120,
};

export const podFulfilled = functions
  .runWith(settings)
  .pubsub.topic("pod-fulfilled")
  .onPublish(async (message) => {
    const decoded = decodeBase64(message.data);
    const order = JSON.parse(decoded) as ShopifyPubSubOrder;
    functions.logger.info({order});

    const {tags} = order;
    const {id: merchant_order_id, domain} = extractIdAndDomain(tags);
    functions.logger.warn(
      `💳 [PUBSUB] - Order FULFILLED (POD): ${
        domain.split(".")[0]
      } ${merchant_order_id}`,
    );

    // Get Merchant Document from POD Order
    const {data} = await fetchSubcollectionDocument(
      "shopify_pod",
      domain,
      "orders",
      merchant_order_id,
    );

    const merchant_order = data as OrderDocument;
    if (!merchant_order) return;

    let tracking = "";
    if (!merchant_order.is_wholesale) {
      tracking = await handlePODFulfillmentPubSub(
        order,
        merchant_order,
        domain,
        merchant_order_id,
      );
    } else {
      tracking = order.fulfillments[0]?.tracking_url || "";
    }

    // Update Object
    merchant_order.tracking_number = tracking ? tracking : "";
    merchant_order.fulfillment_status = "ACTIVE";
    await updateSubcollectionDocument(
      "shopify_pod",
      domain,
      "orders",
      merchant_order_id,
      merchant_order,
    );

    // Handle Analytics
    await updateDailyFulfillAnalytics(merchant_order, domain);
    // console.log({final_day: daily});
    await updateMonthlyFulfillAnalytics(merchant_order, domain);
    // console.log({final_month: monthly});
  });

/**
 * Exctract the order ID for the respected merchant from the POD tagged order
 * @param {string} inputString tag as a string for order
 * @returns
 */
function extractIdAndDomain(inputString: string) {
  console.log({tags: inputString});
  const items = inputString.split(",");
  const numberRegex = /\d+/;

  let id = "";
  let domain = "";

  items.forEach((item) => {
    const trimmedItem = item.trim();
    if (numberRegex.test(trimmedItem)) {
      id = trimmedItem.match(numberRegex)![0];
    } else {
      domain = trimmedItem;
    }
  });

  return {id, domain};
}
