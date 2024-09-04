import {
  getCurrentUnixTimeStampFromTimezone,
  getMonthStartUnixTimeStampFromTimezone,
} from "../../utils/time";
import * as admin from "firebase-admin";
import {ShopData} from "../types/shopify/shop";
import {ShopifyMerchant} from "../types/merchants";

// Utility function to split full name into first and last names
const splitName = (fullName: string): {firstName: string; lastName: string} => {
  const [firstName, ...lastName] = fullName.split(" ");
  return {
    firstName: firstName || "",
    lastName: lastName.join(" ") || "",
  };
};

/**
 * Constructs a Shopify merchant payload with specified store details and webhook configurations.
 * @param {string} token - Access token for the Shopify API.
 * @param {{shop_update: number; complete_order_id: number;}} webhooks - Webhook IDs for shop updates and complete orders.
 * @param {ShopData} store - Shop data including owner, email, phone, domain, and address details.
 * @param {{location_id: number; id: number;}} fulfillment - Fulfillment details including location and ID.
 * @returns {ShopifyMerchant} A structured ShopifyMerchant object containing comprehensive shop details, owner info, and webhook configurations.
 */
export const merchantPayload = (
  token: string,
  webhooks: {
    shop: number;
    order: number;
  },
  store: ShopData,
  fulfillment: {
    location_id: number;
    id: number;
  },
): ShopifyMerchant => {
  const {firstName, lastName} = splitName(store.shop_owner);

  const currentTime =
    admin.firestore && admin.firestore.Timestamp
      ? admin.firestore.Timestamp.now()
      : new Date();
  return {
    analytics: {
      orders_summary: {
        awaiting: 0,
        fulfilled: 0,
        failed: 0,
      },
      recent_orders: [],
      highlight_stats: {
        revenue: 0,
        sold: 0,
      },
      current_month: getMonthStartUnixTimeStampFromTimezone(store.timezone),
    },
    state: getCurrentUnixTimeStampFromTimezone(store.timezone),
    owner: {
      first_name: firstName,
      last_name: lastName,
      email: store.email || "",
      phone: store.phone || "",
    },
    subscription_id: "",
    webhooks: {
      order: webhooks.order || 0,
      shop: webhooks.shop || 0,
    },
    fulfillment: fulfillment || {
      location_id: 0,
      id: 0,
    },
    status: "DECLINED",
    installed: true,
    id: store.myshopify_domain,
    usage: 0,
    capped_usage: 5000,
    address: store.address || {
      address1: "",
      city: "",
      province: "",
      zip: "",
      country: "",
    },
    timezone: store.timezone || "chicago/america",
    access_token: token || "",
    shop_name: store.name || "",
    shop_domain: store.domain || store.myshopify_domain || "",
    myshopify_domain: store.myshopify_domain || "",
    created_at: currentTime,
    updated_at: currentTime,
  } as ShopifyMerchant;
};
