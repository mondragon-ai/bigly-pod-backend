import {
  fetchSubcollectionDocument,
  updateSubcollectionDocument,
} from "../../database/firestore";
import {
  getCurrentUnixTimeStampFromTimezone,
  getDayStartUnixTimeStampFromTimezone,
  getMonthStartUnixTimeStampFromTimezone,
} from "../../utils/time";
import {calculateTotalRevenue} from "./billing";
import {OrderDocument} from "../types/orders";
import {AnalyticsProps} from "../types/analytics";

// ! ================================================================================
// ! 1. Fetch / Create Analytics
// ! ================================================================================

export const buildAnalyticProps = (timezone: string, current_time: number) => {
  const analytics: AnalyticsProps = {
    id: current_time,
    total_orders: 0,
    total_items: 0,
    total_revenue: 0,
    timezone: timezone,
    created_at: current_time,
    updated_at: current_time,
    orders: [],
    top_sellers: {},
    top_types: {},
  };

  return analytics;
};
/**
 * Fetches the daily analytics for a given domain and timezone. If no analytics exist for the current day, it initializes a new set.
 * @param {string} timezone - The merchant's timezone.
 * @param {string} domain - The domain identifier for the merchant.
 * @returns {Promise<AnalyticsProps>} The daily analytics data.
 */
export const fetchDailyAnalytics = async (
  timezone: string,
  domain: string,
): Promise<AnalyticsProps> => {
  const current_time = getDayStartUnixTimeStampFromTimezone(timezone);
  const analytics = buildAnalyticProps(timezone, current_time);

  const {data, status} = await fetchSubcollectionDocument(
    "shopify_pod",
    domain,
    "daily_analytics",
    String(current_time),
  );
  if (!data || status > 300) {
    return analytics;
  }
  return data as AnalyticsProps;
};

/**
 * Fetches the monthly analytics for a given domain and timezone. If no analytics exist for the current month, it initializes a new set.
 * @param {string} timezone - The merchant's timezone.
 * @param {string} domain - The domain identifier for the merchant.
 * @returns {Promise<AnalyticsProps>} The monthly analytics data.
 */
export const fetchMonthlyAnalytics = async (
  timezone: string,
  domain: string,
): Promise<AnalyticsProps> => {
  const current_time = getMonthStartUnixTimeStampFromTimezone(timezone);
  const analytics = buildAnalyticProps(timezone, current_time);

  const {data, status} = await fetchSubcollectionDocument(
    "shopify_pod",
    domain,
    "monthly_analytics",
    String(current_time),
  );
  if (!data || status > 300) {
    return analytics;
  }
  return data as AnalyticsProps;
};

// ! ================================================================================
// ! 2. Initial Update (Order Complete)
// ! ================================================================================

/**
 * Updates daily analytics based on a new order. Adds revenue, updates item counts, and aggregates top sellers and types.
 * @param {OrderDocument} order - The order document containing items and prices.
 * @param {string} domain - The domain identifier for the merchant.
 * @returns {Promise<AnalyticsProps>} The updated daily analytics data.
 */
export const updateDailyAnalytics = async (
  order: OrderDocument,
  domain: string,
): Promise<AnalyticsProps> => {
  const {pod_line_items, shipping_rate, merchant_order, id, timezone} = order;
  const TODAY = getDayStartUnixTimeStampFromTimezone(timezone);

  // Fetch Daily/Monthly analytics
  const daily = await fetchDailyAnalytics(timezone, domain);
  // console.log({daily});

  // Add Price
  const total_revenue =
    calculateTotalRevenue(pod_line_items) + daily.total_revenue || 0;

  // Add Item(s)
  const total_items = (pod_line_items || []).length + daily.total_items;

  // Add top sellers
  const top_sellers = daily.top_sellers || {};
  merchant_order.line_items.forEach((li) => {
    const {title, quantity} = li;
    if (top_sellers[title] !== undefined) {
      top_sellers[title] += quantity;
    } else {
      top_sellers[title] = quantity;
    }
  });

  const total_orders = 1 + daily.total_orders;

  const current_time = getCurrentUnixTimeStampFromTimezone(timezone);

  // Add add order object
  const orders = daily.orders || [];
  orders.push({
    id: id,
    created_at: current_time,
    total_items: (pod_line_items || []).length,
    total_price: Number(calculateTotalRevenue(pod_line_items) || 0),
    fulfilled_date: 0,
    fulfilled_time: 0,
    shipping_cost: Number(shipping_rate + 2),
  });

  const top_types = daily.top_types || {};
  pod_line_items.forEach((li) => {
    const {type, quantity} = li;
    if (top_types[type] !== undefined) {
      top_types[type] += quantity;
    } else {
      top_types[type] = quantity;
    }
  });

  const analytics: AnalyticsProps = {
    ...daily,
    id: String(TODAY),
    total_orders: total_orders,
    total_items: total_items,
    total_revenue: total_revenue,
    timezone: timezone,
    updated_at: current_time,
    orders: orders,
    top_sellers: top_sellers,
    top_types: top_types,
  };

  // Update Document
  await updateSubcollectionDocument(
    "shopify_pod",
    domain,
    "daily_analytics",
    String(TODAY),
    analytics,
  );

  return analytics;
};

/**
 * Updates monthly analytics similar to daily but accumulates over the month.
 * @param {OrderDocument} order - The order document containing items and prices.
 * @param {string} domain - The domain identifier for the merchant.
 * @returns {Promise<AnalyticsProps>} The updated monthly analytics data.
 */
export const updateMonthlyAnalytics = async (
  order: OrderDocument,
  domain: string,
): Promise<AnalyticsProps> => {
  const {pod_line_items, shipping_rate, merchant_order, id, timezone} = order;
  const MONTH = getMonthStartUnixTimeStampFromTimezone(timezone);

  // Fetch Monthly analytics
  const monthly = await fetchMonthlyAnalytics(timezone, domain);
  // console.log({monthly});

  // Add Price
  const total_revenue =
    calculateTotalRevenue(pod_line_items) + monthly.total_revenue;

  // Add Item(s)
  const total_items = (pod_line_items || []).length + monthly.total_items;

  // Add top sellers
  const top_sellers = monthly.top_sellers || {};
  merchant_order.line_items.forEach((li) => {
    const {title, quantity} = li;
    if (top_sellers[title] !== undefined) {
      top_sellers[title] += quantity;
    } else {
      top_sellers[title] = quantity;
    }
  });

  const total_orders = 1 + monthly.total_orders;

  const current_time = getCurrentUnixTimeStampFromTimezone(timezone);

  // Add add order object
  const orders = monthly.orders || [];
  orders.push({
    id: id,
    created_at: current_time,
    total_items: (pod_line_items || []).length,
    total_price: Number(calculateTotalRevenue(pod_line_items) || 0),
    fulfilled_date: 0,
    fulfilled_time: 0,
    shipping_cost: Number(shipping_rate + 2),
  });

  const top_types = monthly.top_types || {};
  pod_line_items.forEach((li) => {
    const {type, quantity} = li;
    if (top_types[type] !== undefined) {
      top_types[type] += quantity;
    } else {
      top_types[type] = quantity;
    }
  });

  const analytics: AnalyticsProps = {
    ...monthly,
    id: String(MONTH),
    total_orders: total_orders,
    total_items: total_items,
    total_revenue: total_revenue,
    timezone: timezone,
    updated_at: current_time,
    orders: orders,
    top_sellers: top_sellers,
    top_types: top_types,
  };

  // Update Document
  await updateSubcollectionDocument(
    "shopify_pod",
    domain,
    "monthly_analytics",
    String(MONTH),
    analytics,
  );
  return analytics;
};

// ! ================================================================================
// ! 3. Final Update (Fulfill Complete)
// ! ================================================================================

/**
 * Updates daily analytics to mark an order as fulfilled. It finds the order by ID and updates the fulfillment date.
 * @param {OrderDocument} order - The order document to be marked as fulfilled.
 * @param {string} domain - The domain identifier for the merchant.
 * @returns {Promise<AnalyticsProps>} The updated daily analytics data with the fulfillment time noted.
 */
export const updateDailyFulfillAnalytics = async (
  order: OrderDocument,
  domain: string,
): Promise<AnalyticsProps> => {
  const {id, timezone} = order;
  const TODAY = getDayStartUnixTimeStampFromTimezone(timezone);

  // Fetch Daily/Monthly analytics
  const daily = await fetchDailyAnalytics(timezone, domain);
  // console.log({ful_daily: daily});

  const current_time = getCurrentUnixTimeStampFromTimezone(timezone);

  // Add add order object
  const orders = daily.orders || [];
  const order_list = orders.map((o) => {
    if (o.id == id) {
      return {
        ...o,
        fulfilled_date: current_time,
      };
    } else {
      return o;
    }
  });

  const analytics = {
    ...daily,
    updated_at: current_time,
    orders: order_list,
  } as AnalyticsProps;

  // Update Document
  await updateSubcollectionDocument(
    "shopify_pod",
    domain,
    "daily_analytics",
    String(TODAY),
    analytics,
  );

  return analytics;
};

/**
 * Updates monthly analytics to mark an order as fulfilled. Similar to the daily function but for the monthly dataset.
 * @param {OrderDocument} order - The order document to be marked as fulfilled.
 * @param {string} domain - The domain identifier for the merchant.
 * @returns {Promise<AnalyticsProps>} The updated monthly analytics data with the fulfillment time noted.
 */
export const updateMonthlyFulfillAnalytics = async (
  order: OrderDocument,
  domain: string,
): Promise<AnalyticsProps> => {
  const {id, timezone} = order;
  const TODAY = getMonthStartUnixTimeStampFromTimezone(timezone);

  // Fetch Daily/Monthly analytics
  const monthly = await fetchMonthlyAnalytics(timezone, domain);
  // console.log({full_monthly: monthly});

  const current_time = getCurrentUnixTimeStampFromTimezone(timezone);

  // Add add order object
  const orders = monthly.orders || [];
  const order_list = orders.map((o) => {
    if (o.id == id) {
      return {
        ...o,
        fulfilled_date: current_time,
      };
    } else {
      return o;
    }
  });

  const analytics = {
    ...monthly,
    updated_at: current_time,
    orders: order_list,
  } as AnalyticsProps;

  // Update Document
  await updateSubcollectionDocument(
    "shopify_pod",
    domain,
    "monthly_analytics",
    String(TODAY),
    analytics,
  );

  return analytics;
};
