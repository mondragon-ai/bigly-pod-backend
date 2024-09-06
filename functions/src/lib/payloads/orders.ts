import {convertColorForSKu} from "../../utils/formatter";
import {
  generateRandom13DigitNumber,
  generateRandomOrderNumber,
} from "../../utils/generator";
import {ShopifyMerchant} from "../types/merchants";
import {
  CustomerWholesale,
  LineItem,
  OrderDocument,
  PODLineItemsProps,
} from "../types/orders";
import {ProductDocument} from "../types/products";
import {
  Address,
  ShopifyLineItem,
  ShopifyPubSubOrder,
} from "../types/shopify/orders";
import * as admin from "firebase-admin";

/**
 * Creates a POD (Print-on-Demand) order payload that combines merchant and Shopify order data.
 *
 * @param {string} domain - The domain of the Shopify store.
 * @param {ShopifyMerchant} merchant - The Shopify merchant information.
 * @param {number} shipping_rate - The shipping rate for the order.
 * @param {Object} merchant_payload - The merchant order payload.
 * @param {{ variant_id: string; quantity: number; weight: number; }[]} pod_line_items - The POD line items.
 * @param {Object} customer - The customer information.
 * @returns {OrderDocument | null} The combined order payload or null if line items are empty.
 */
export const createPodOrderPayload = (
  domain: string,
  merchant: ShopifyMerchant,
  shipping_rate: number,
  merchant_payload: {
    order_id: string | number;
    line_items: LineItem[];
    order_number: string | number;
  },
  pod_line_items: PODLineItemsProps[],
  customer: {
    customer: {
      customers: {
        id: number;
      }[];
    };
    email: string;
    shipping_address: Address;
  },
  is_wholesale = false,
): OrderDocument | null => {
  const shopify_uuid =
    customer.customer.customers[0] && customer.customer.customers[0].id
      ? customer.customer.customers[0].id
      : "";
  const shippingLines = [
    {
      custom: true,
      price: String(Number(shipping_rate) + 2.0),
      title: "Standard Shipping",
    },
  ];

  const line_items = pod_line_items.map((li) => {
    return {
      variant_id: String(li.variant_id),
      quantity: String(li.quantity),
    };
  });

  const currentTime =
    admin.firestore && admin.firestore.Timestamp
      ? admin.firestore.Timestamp.now()
      : new Date();

  const order_payload: OrderDocument = {
    shipping_rate,
    domain,
    myshopify_domain: merchant.myshopify_domain,
    timezone: merchant.timezone,
    access_token: merchant.access_token,
    location_id: merchant.fulfillment.location_id,
    pod_line_items,
    customer: {
      id: Number(shopify_uuid),
      email: customer.email,
      shipping_address: customer.shipping_address,
    },
    merchant_order: merchant_payload,
    shopify_order_payload: {
      line_items: line_items.length > 0 ? line_items : [],
      currency: "USD",
      financial_status: "paid",
      customer: {
        id: Number(shopify_uuid),
      },
      tags: `${domain}, ${merchant_payload.order_id}`,
      shipping_lines: shippingLines,
      shipping_address: customer.shipping_address,
    },
    fulfillment_status: "DEACTIVE",
    tracking_number: "",
    pod_created: false,
    created_at: currentTime,
    updated_at: currentTime,
    id: String(merchant_payload.order_id),
    fulfillment_id: "",
    is_wholesale: is_wholesale,
  };

  if (line_items.length > 0 || shopify_uuid !== "") {
    return order_payload;
  }

  return null;
};

/**
 * Creates a complete order payload by combining merchant and Shopify order data.
 *
 * @param {number} order_id - The order ID.
 * @param {string} domain - The domain of the Shopify store.
 * @param {any} merchant - The merchant information.
 * @param {ShopifyLineItem[]} line_items - The Shopify line items.
 * @param {any[]} pod_line_items - The POD line items.
 * @param {any} customer - The customer information.
 * @param {string} email - The customer's email address.
 * @param {Address} shipping_address - The shipping address for the order.
 * @param {number} shipping_rate - The shipping rate for the order.
 * @returns {OrderDocument | null} The combined order payload or null if line items are empty.
 */
export const createOrderPayload = (
  order: ShopifyPubSubOrder,
  domain: string,
  merchant: ShopifyMerchant,
  pod_line_items: PODLineItemsProps[],
  customer: any,
  shipping_rate: number,
  is_wholesale = false,
): OrderDocument | null => {
  const line_items =
    order.line_items &&
    order.line_items.map((li) => convertShopifyLineItemToLineItem(li));

  const shopify_customer = {
    customer,
    email: order.email,
    shipping_address: order.shipping_address,
  };

  const merchant_order = {
    order_id: order.id,
    line_items: line_items,
    order_number: order.order_number,
  };
  return createPodOrderPayload(
    domain,
    merchant,
    shipping_rate,
    merchant_order,
    pod_line_items,
    shopify_customer,
    is_wholesale,
  );
};

/**
 * Converts a Shopify line item object to a generic line item format.
 *
 * @param {ShopifyLineItem} shopifyLineItem - The Shopify line item object to convert.
 * @returns {LineItem} A generic line item object with standardized fields.
 *
 *  */
export function convertShopifyLineItemToLineItem(
  shopifyLineItem: ShopifyLineItem,
): LineItem {
  return {
    product_id: shopifyLineItem.product_id,
    variant_id: shopifyLineItem.variant_id,
    weight: shopifyLineItem.grams || 85,
    title: shopifyLineItem.title,
    quantity: shopifyLineItem.quantity,
    price: shopifyLineItem.price,
    sku: shopifyLineItem.sku,
    variant_title: shopifyLineItem.variant_title,
  };
}

/**
 * Builds a payload for a POD (Print on Demand) line item based on product data, color, and quantity.
 * This function selects the appropriate variant based on color and constructs a line item for order processing.
 *
 * @param {ProductDocument} product - The product document containing variant and other product information.
 * @param {string} color - The color variant to filter.
 * @param {number} quantity - The quantity of the item to order.
 * @returns {PODLineItemsProps} A single POD line item containing necessary details for order fulfillment.
 *
 */
export const buildPODLineItemPayload = (
  product: ProductDocument,
  color: string,
  quantity: number,
) => {
  const images = product.mockup_urls;
  let pod_item: PODLineItemsProps = {
    variant_id: "",
    quantity: 0,
    weight: 0,
    cost: 0,
    image: "",
    type: "hoodie_lane_7",
    merchant_variants_id: "",
  };

  /* eslint-disable indent */
  for (const vars of product.merged_variants) {
    const SKU = vars.SKU.toLocaleLowerCase();
    if (String(SKU).includes(convertColorForSKu(color).toLocaleLowerCase())) {
      const url = images.filter(
        (i) => !SKU.includes(convertColorForSKu(i.alt).toLocaleLowerCase()),
      )[0]
        ? images.filter(
            (i) => !SKU.includes(convertColorForSKu(i.alt).toLocaleLowerCase()),
          )[0].url
        : "";

      pod_item = {
        variant_id: vars.pod_variants_id,
        merchant_variants_id: vars.merchant_variants_id,
        quantity: quantity,
        weight: product.weight || 85,
        type: product.type,
        cost: Number(Number(vars.cost).toFixed(2)),
        image:
          url && url !== ""
            ? url
            : images[0] && images[0].url
            ? images[0].url
            : "",
      };
    }
  }
  /* eslint-enable indent */
  return pod_item;
};

/**
 * Converts a product and its POD line item into a generic line item format suitable for order processing.
 * This function adjusts cost calculations and formats SKU and variant titles.
 *
 * @param {ProductDocument} product - The product document.
 * @param {PODLineItemsProps} pod_line_item - The POD line item created for the order.
 * @param {number} quantity - The quantity of the item.
 * @param {string} color - The product color.
 * @returns {LineItem} The converted line item ready for inclusion in an order.
 *
 */
export function convertLineItemToLineItem(
  product: ProductDocument,
  pod_line_item: PODLineItemsProps,
  quantity: number,
  color: string,
): LineItem {
  const color_sku = convertColorForSKu(color);
  return {
    product_id: Number(product.product_id),
    variant_id: Number(pod_line_item.variant_id),
    weight: pod_line_item.weight,
    title: product.title,
    quantity: quantity,
    price: Number(Number(pod_line_item.cost * 2.5)).toFixed(2),
    sku: product.base_sku + `-${color_sku}`,
    variant_title: `OSFA / ${color_sku}`,
  };
}

/**
 * Builds the order payload for a merchant based on customer and product information.
 * This function packages all necessary order data including customer details and the product line items into a structured order object.
 *
 * @param {CustomerWholesale} customer - The wholesale customer's details.
 * @param {ProductDocument} product - The product information.
 * @param {PODLineItemsProps} pod_line_item - The prepared line item for the order.
 * @param {number} quantity - The quantity of the product.
 * @param {string} color - The product color.
 * @returns {Object} An object representing the merchant's order.
 *
 */
export const buildMerchantOrderPayload = (
  customer: CustomerWholesale,
  product: ProductDocument,
  pod_line_item: PODLineItemsProps,
  quantity: number,
  color: string,
) => {
  const {email, address} = customer;

  return {
    email: email,
    shipping_address: address,
    line_items: [
      convertLineItemToLineItem(product, pod_line_item, quantity, color),
    ],
    id: generateRandom13DigitNumber(),
    order_number: generateRandomOrderNumber("WHOLESALE-"),
  };
};
