import {
  createSubcollectionDocument,
  deleteSubcollectionDocument,
  fetchPaginatedSubcollection,
  fetchSubcollectionCollection,
  fetchSubcollectionDocument,
} from "../../../database/firestore";
import {fetchMerchantFromDB} from "../../../database/merchant";
import {
  updateDailyAnalytics,
  updateMonthlyAnalytics,
} from "../../../lib/helpers/analytics";
import {updateMerchantUsage} from "../../../lib/helpers/billing";
import {createPODOrder} from "../../../lib/helpers/orders";

import {generateShippingRates} from "../../../lib/helpers/shipengine";
import {createShopifyCustomer} from "../../../lib/helpers/shopify/customers";
import {
  buildMerchantOrderPayload,
  buildPODLineItemPayload,
  createOrderPayload,
} from "../../../lib/payloads/orders";
import {CustomerWholesale, OrderDocument} from "../../../lib/types/orders";
import {ProductDocument} from "../../../lib/types/products";
import {ServicesReponseType} from "../../../lib/types/shared";
import {ShopifyPubSubOrder} from "../../../lib/types/shopify/orders";
import {
  processFulfillment,
  updateOrderDocument,
} from "../../../triggers/orders";
import {createErrorResponse} from "../../../utils/errors";

/**
 * Fetches orders for a given domain and optional order ID. If the order ID is provided, it fetches a specific order;
 * otherwise, it fetches all orders for that domain.
 * @param {string} domain - The domain identifier for the merchant.
 * @param {string | null} order_id - Optional specific order ID to fetch.
 * @returns {Promise<ServicesReponseType>} An object containing the status, data array, error flag, and status text related to the fetch operation.
 */
export const fetchOrders = async (
  domain: string,
  order_id: string | null,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: [],
    error: false,
    text: "Orders Fetched Sucessfully",
  };

  if (!domain || domain == "") {
    res.error = true;
    res.status = 404;
    res.text = "Merchant not present";
  }

  /* eslint-disable indent */
  const fetchFunc = order_id
    ? () =>
        fetchSubcollectionDocument("shopify_pod", domain, "orders", order_id)
    : () => fetchSubcollectionCollection("shopify_pod", domain, "orders");
  /* eslint-enable indent */

  const {data, text, status} = await fetchFunc();
  res.status = status;
  res.text = status < 300 ? res.text : text;
  res.data = data ? (order_id ? [data] : data) : [];

  return res;
};

/**
 * Deletes orders for a given domain and optional order ID or list of orders.
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @param {string | null} order_id - Optional specific order ID to delete.
 * @param {string[] | null} orders - Optional list of order IDs to delete.
 * @returns {Promise<ServicesReponseType>} An object containing the status, data array, error flag, and status text related to the delete operation.
 */
export const deleteOrders = async (
  domain: string,
  order_id: string | null,
  orders: string[] | null,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: 1,
    error: false,
    text: "Orders deleted sucessfully",
  };

  if (!domain) {
    return {
      status: 400,
      error: true,
      text: "Merchant domain is required.",
      data: 0,
    };
  }

  let orders_closed = order_id != "" ? 1 : 0;

  try {
    if (orders && orders.length > 0) {
      const ordersToDelete = orders.map(async (orderId) => {
        const {status, text} = await deleteSubcollectionDocument(
          "shopify_pod",
          domain,
          "orders",
          orderId,
        );
        res.status = status;
        res.text = status < 300 ? res.text : text;
        orders_closed += 1;
      });
      await Promise.all(ordersToDelete);
    } else if (order_id) {
      const {status, text} = await deleteSubcollectionDocument(
        "shopify_pod",
        domain,
        "orders",
        order_id,
      );
      res.status = status;
      res.text = status < 300 ? res.text : text;
      orders_closed = 1;
    }
  } catch (error) {
    res.status = 500;
    res.error = true;
    res.text = "Failed to delete orders.";
    res.data = 0;
  }
  res.data = orders_closed;

  return res;
};

/**
 * Fetches the next paginated list of orders for a given domain
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @param {string | null} last_item_seconds - Last order (seconds).
 * @returns {Promise<ServicesReponseType>} An object containing the status, data array, error flag, and status text related to the delete operation.
 */
export const fetchNextOrderList = async (
  domain: string,
  last_item_seconds: string | null,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: [],
    error: false,
    text: "Next list of orders fetched sucessfully",
  };

  if (!last_item_seconds || !domain) {
    return {
      status: 400,
      error: true,
      text: "Merchant domain or last item is required.",
      data: null,
    };
  }

  const {status, text, data} = await fetchPaginatedSubcollection(
    "shopify_pod",
    domain,
    "orders",
    last_item_seconds,
    "next",
  );

  res.status = status;
  res.text = status < 300 ? res.text : text;
  res.data = data ? data : [];

  return res;
};

/**
 * Fetches the next paginated list of orders for a given domain
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @param {string | null} first_item_seconds - First order (seconds).
 * @returns {Promise<ServicesReponseType>} An object containing the status, data array, error flag, and status text related to the delete operation.
 */
export const fetchPreviousOrderList = async (
  domain: string,
  first_item_seconds: string | null,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: [],
    error: false,
    text: "Next list of orders fetched sucessfully",
  };

  if (!first_item_seconds || !domain) {
    return {
      status: 400,
      error: true,
      text: "Merchant domain or first item is required.",
      data: null,
    };
  }

  const {status, text, data} = await fetchPaginatedSubcollection(
    "shopify_pod",
    domain,
    "orders",
    first_item_seconds,
    "prev",
  );

  res.status = status;
  res.text = status < 300 ? res.text : text;
  res.data = data ? data : [];

  return res;
};

/**
 * Processes a wholesale order by fetching relevant merchant and product information,
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @param {number} quantity - The quantity of the product ordered.
 * @param {string} color - The color variant of the product ordered.
 * @param {string} product_id - The unique identifier for the product.
 * @param {CustomerWholesale} customer - Detailed information about the customer placing the order.
 * @returns {Promise<{status: number; ok: boolean; text: string; result?: any; error?: string}>} An object detailing the outcome of the operation, including status codes and contextual messages.
 *
 */
export const processWholesale = async (
  domain: string,
  quantity: number,
  color: string,
  product_id: string,
  customer: CustomerWholesale,
) => {
  try {
    // Get Merchant
    const merchant = await fetchMerchantFromDB(domain);
    if (!merchant) return createErrorResponse(400, "Merchant Not Found");

    // Get Product
    const {data} = await fetchSubcollectionDocument(
      "shopify_pod",
      domain,
      "products",
      String(product_id),
    );
    const product = data as ProductDocument;
    if (!product) return createErrorResponse(400, "Product Not Found");

    // Create POD Line Item
    const pod_line_items = buildPODLineItemPayload(product, color, quantity);

    // If no variants found, exit early
    if (!pod_line_items.variant_id || !merchant) {
      return createErrorResponse(422, "Error mapping Product");
    }

    // Create or Fetch Shopify Customer ID using email
    const shopify_customer = await createShopifyCustomer(
      customer.address,
      customer.email,
    );

    // Generate Shipping Rate
    const shipping_rate = await generateShippingRates(customer.address, [
      pod_line_items,
    ]);

    // Build Merchant Payload
    const order = buildMerchantOrderPayload(
      customer,
      product,
      pod_line_items,
      quantity,
      color,
    );

    // Create Order Payload
    const payload = createOrderPayload(
      order as unknown as ShopifyPubSubOrder,
      domain,
      merchant,
      [pod_line_items],
      shopify_customer,
      shipping_rate,
      true,
    );

    if (!payload) {
      return createErrorResponse(422, "ERROR: Payload doesn't exist");
    }

    // Save Order
    await createSubcollectionDocument(
      "shopify_pod",
      domain,
      "orders",
      String(order.id),
      payload,
    );

    return {
      status: 201,
      ok: true,
      text: "Successfully created",
      result: payload,
      error: null,
    };
  } catch (error) {
    return createErrorResponse(500, "Internal Server");
  }
};

export const chargeAndFulfillOrder = async (
  domain: string,
  order_id: string,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: [],
    error: false,
    text: "Orders Fetched Sucessfully",
  };

  if (!order_id || !domain) {
    res.error = true;
    res.status = 400;
    res.text = "Missing paramaters";
  }

  // Get Merchant Document from POD Order
  const {data} = await fetchSubcollectionDocument(
    "shopify_pod",
    domain,
    "orders",
    order_id,
  );

  const merchant_order = data as OrderDocument;
  if (!merchant_order) {
    res.error = true;
    res.status = 400;
    res.text = "Couldn't fetch order";
    return res;
  }
  const {
    access_token,
    pod_line_items,
    myshopify_domain,
    shipping_rate,
    is_wholesale,
    shopify_order_payload,
    location_id,
  } = merchant_order;

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
    await updateOrderDocument(domain, order_id, {
      ...merchant_order,
      pod_created: false,
      fulfillment_status: "BILLING",
    });
    res.error = true;
    res.status = 422;
    res.text = "Couldn't charge merchant";
    return res;
  }

  // Send order to POD
  const pod_order = await createPODOrder(shopify_order_payload);
  if (!pod_order) {
    res.error = true;
    res.status = 400;
    res.text = "Couldn't POD payload";
    return res;
  }

  let fulfillment_id = "" as string | null;
  if (!is_wholesale) {
    // Handle Fulfillment
    fulfillment_id = await processFulfillment(
      access_token,
      myshopify_domain,
      String(order_id),
      location_id,
    );
  }

  // Update Order Document
  await updateOrderDocument(domain, order_id, {
    ...merchant_order,
    pod_created: true,
    fulfillment_status: "PENDING",
    fulfillment_id: String(fulfillment_id || ""),
  });

  await updateDailyAnalytics(merchant_order, domain);

  await updateMonthlyAnalytics(merchant_order, domain);

  return res;
};
