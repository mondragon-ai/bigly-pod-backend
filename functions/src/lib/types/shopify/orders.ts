import {ShopifyCustomer} from "./customers";

export type ShopifyOrder = {
  shipping_address: Address;
  order_status_url: string;
  tracking_url: string;
  order_number: string;
  addresses: Address[];
  app_id: number;
  billing_address: Address;
  browser_ip: string;
  buyer_accepts_marketing: boolean;
  cancel_reason: string;
  cancelled_at: string;
  cart_token: string;
  checkout_token: string;
  client_details: {
    accept_language: string;
    browser_height: number;
    browser_ip: string;
    browser_width: number;
    session_hash: string;
    user_agent: string;
  };
  closed_at: string;
  company: {
    id: number;
    location_id: number;
  };
  created_at: string;
  currency: string;
  current_total_additional_fees_set: MoneySet;
  current_total_discounts: string;
  current_total_discounts_set: {
    current_total_discounts_set: MoneySet;
  };
  current_total_duties_set: {
    current_total_duties_set: MoneySet;
  };
  current_total_price: string;
  current_total_price_set: {
    current_total_price_set: MoneySet;
  };
  current_subtotal_price: string;
  current_subtotal_price_set: {
    current_subtotal_price_set: MoneySet;
  };
  current_total_tax: string;
  current_total_tax_set: {
    current_total_tax_set: MoneySet;
  };
  customer: ShopifyCustomer;
  customer_locale: string;
  discount_applications: {
    discount_applications: DiscountApplication[];
  };
  discount_codes: Array<{
    code: string;
    amount: string;
    type: string;
  }>;
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillments: {
    tracking_company: string;
    tracking_number: string;
    tracking_url: string;
  }[];
  fulfillment_status: string;
  gateway: string;
  id: number;
  landing_site: string;
  line_items: ShopifyLineItem[];
  total_price: string;
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

type MoneySet = {
  shop_money: {
    amount: string;
    currency_code: string;
  };
  presentment_money: {
    amount: string;
    currency_code: string;
  };
};

type DiscountApplication = {
  type: string;
  title?: string;
  description?: string;
  value: string;
  value_type: string;
  allocation_method: string;
  target_selection: string;
  target_type: string;
  code?: string;
};

export type ShopifyPubSubOrder = {
  id: number;
  admin_graphql_api_id: string;
  app_id: number;
  browser_ip: null | string;
  buyer_accepts_marketing: boolean;
  cancel_reason: null | string;
  cancelled_at: null | string;
  cart_token: null | string;
  checkout_id: null | string;
  checkout_token: null | string;
  client_details: null | string;
  closed_at: string;
  company: null | string;
  confirmation_number: string;
  confirmed: boolean;
  contact_email: string;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_subtotal_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  current_total_additional_fees_set: null | string;
  current_total_discounts: string;
  current_total_discounts_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  current_total_duties_set: null | string;
  current_total_price: string;
  current_total_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  current_total_tax: string;
  current_total_tax_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  customer_locale: null | string;
  device_id: null | string;
  discount_codes: string[];
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillment_status: string;
  landing_site: null | string;
  landing_site_ref: null | string;
  location_id: null | string;
  merchant_of_record_app_id: null | string;
  name: string;
  note: null | string;
  note_attributes: string[];
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_additional_fees_set: null | string;
  original_total_duties_set: null | string;
  payment_gateway_names: string[];
  phone: null | string;
  po_number: null | string;
  presentment_currency: string;
  processed_at: string;
  reference: null | string;
  referring_site: null | string;
  source_identifier: null | string;
  source_name: string;
  source_url: null | string;
  subtotal_price: string;
  subtotal_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  tags: string;
  tax_exempt: boolean;
  tax_lines: string[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_discounts_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_line_items_price: string;
  total_line_items_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_outstanding: string;
  total_price: string;
  total_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_shipping_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_tax: string;
  total_tax_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: null | string;
  billing_address: null | string;
  customer: {
    id: number;
    email: string;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    state: string;
    note: null | string;
    verified_email: boolean;
    multipass_identifier: null | string;
    tax_exempt: boolean;
    phone: null | string;
    email_marketing_consent: {
      state: string;
      opt_in_level: string;
      consent_updated_at: null | string;
    };
    sms_marketing_consent: null | string;
    tags: string;
    currency: string;
    tax_exemptions: string[];
    admin_graphql_api_id: string;
    default_address: Address;
  };
  discount_applications: string[];
  fulfillments: {
    id: number;
    admin_graphql_api_id: string;
    created_at: string;
    location_id: number;
    name: string;
    order_id: number;
    origin_address: any;
    receipt: any;
    service: string;
    shipment_status: null | string;
    status: string;
    tracking_company: string;
    tracking_number: string;
    tracking_numbers: string[];
    tracking_url: string;
    tracking_urls: string[];
    updated_at: string;
    line_items: ShopifyLineItem[];
  }[];
  line_items: ShopifyLineItem[];
  payment_terms: null | string;
  refunds: string[];
  shipping_address: Address;
  shipping_lines: {
    id: number;
    carrier_identifier: null | string;
    code: string;
    discounted_price: string;
    discounted_price_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    is_removed: boolean;
    phone: null | string;
    price: string;
    price_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    requested_fulfillment_service_id: null | string;
    source: null | string;
    title: string;
    tax_lines: string[];
    discount_allocations: string[];
  }[];
};

export type PriceSet = {
  shop_money: MoneySet;
  presentment_money: MoneySet;
};

export type ShopifyLineItem = {
  variant_title: string;
  fulfillment_status: string | null;
  total_discount: string;
  gift_card: boolean;
  requires_shipping: boolean;
  total_discount_set: PriceSet;
  title: string;
  attributed_staffs: string[]; // Assuming it's an array of staff IDs or names
  product_exists: boolean;
  variant_id: number;
  tax_lines: any[]; // Assuming it's an array, type can be adjusted if more details are provided
  price: string;
  vendor: string;
  product_id: number;
  id: number;
  grams: number;
  sku: string;
  fulfillable_quantity: number;
  quantity: number;
  fulfillment_service: string;
  taxable: boolean;
  discount_allocations: any[]; // Assuming it's an array, type can be adjusted if more details are provided
  variant_inventory_management: string | null;
  current_quantity: number;
  admin_graphql_api_id: string;
  name: string;
  price_set: PriceSet;
  properties: any[]; // Assuming it's an array, type can be adjusted if more details are provided
  duties: any[]; // Assuming it's an array, type can be adjusted if more details are provided
};
