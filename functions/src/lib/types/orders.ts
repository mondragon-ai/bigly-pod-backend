import {MockupTypes} from "./generator";

export type OrderDocument = {
  id: string;
  pod_created: boolean;
  shipping_rate: number;
  domain: string;
  myshopify_domain: string;
  timezone: string;
  access_token: string;
  location_id: number | string;
  fulfillment_status: "ACTIVE" | "DEACTIVE";
  tracking_number: string;
  pod_line_items: PODLineItemsProps[];
  customer: {
    id: number;
    email: string;
    shipping_address: Address;
  };
  merchant_order: {
    order_id: string | number;
    line_items: LineItem[];
    order_number: string | number;
  };
  shopify_order_payload: {
    line_items: {
      variant_id: string;
      quantity: string;
    }[];
    currency: "USD" | string;
    financial_status: "paid" | string;
    customer: {
      id: number;
    };
    tags: string;
    shipping_lines: {
      custom: boolean;
      price: string;
      title: string | "Standard Shipping";
    }[];
    shipping_address: Address;
  };
  fulfillment_id: string;
  created_at?: FirebaseFirestore.Timestamp | Date;
  updated_at?: FirebaseFirestore.Timestamp | Date;
  is_wholesale: boolean;
};

export type PODLineItemsProps = {
  variant_id: string;
  quantity: number;
  weight: number;
  cost: number;
  image: string;
  type: MockupTypes;
  merchant_variants_id: string | number;
};

export type Address = {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company: string | null;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
};

export type LineItem = {
  product_id: number;
  variant_id: number;
  weight: number;
  title: string;
  quantity: number;
  price: string;
  sku: string;
  variant_title: string;
};

export type CustomerWholesale = {
  email: string;
  address: Address;
};
