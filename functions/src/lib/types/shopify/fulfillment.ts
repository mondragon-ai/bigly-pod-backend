export type FulfillmentServiceResponse = {
  fulfillment_service: {
    id: number;
    name: string;
    email: null;
    service_name: string;
    handle: string;
    fulfillment_orders_opt_in: boolean;
    include_pending_stock: boolean;
    provider_id: null;
    location_id: number;
    callback_url: string;
    tracking_support: boolean;
    inventory_management: boolean;
    admin_graphql_api_id: string;
    permits_sku_sharing: boolean;
  };
  errors: {
    name: ["has already been taken"];
  };
};

type FulfillmentOrder = {
  id: number;
  shop_id: number;
  order_id: number;
  assigned_location_id: number;
  request_status: string;
  status: string;
  supported_actions: string[];
  destination: {
    id: number;
    address1: string;
    address2: string | null;
    city: string;
    company: string;
    country: string;
    email: string;
    first_name: string;
    last_name: string;
    province: string | null;
    zip: string;
  };
  line_items: {
    id: number;
    shop_id: number;
    fulfillment_order_id: number;
    quantity: number;
    line_item_id: number;
    inventory_item_id: number;
    fulfillable_quantity: number;
    variant_id: number;
  }[];
  fulfill_at: string;
  fulfill_by: string | null;
  international_duties: {
    incoterm: string | null;
  };
  fulfillment_holds: any[]; // Update the type if needed
  delivery_method: {
    id: number;
    method_type: string;
    min_delivery_date_time: string | null;
    max_delivery_date_time: string | null;
  };
  created_at: string;
  updated_at: string;
  assigned_location: {
    address1: string | null;
    address2: string | null;
    city: string | null;
    country_code: string;
    location_id: number;
    name: string;
    phone: string | null;
    province: string | null;
    zip: string | null;
  };
  merchant_requests: any[]; // Update the type if needed
};

export type FulfillmentOrderResponse = {
  fulfillment_orders: FulfillmentOrder[];
};

type FulfillmentService = {
  id: number;
  name: string;
  email: null | string;
  service_name: string;
  handle: string;
  fulfillment_orders_opt_in: boolean;
  include_pending_stock: boolean;
  provider_id: null | number;
  location_id: number;
  callback_url: string;
  tracking_support: boolean;
  inventory_management: boolean;
  admin_graphql_api_id: string;
  permits_sku_sharing: boolean;
};

export type ShopifyFulfillmentResponse = {
  locations: FulfillmentService[];
};

export type ShopifyFSResponse = {
  fulfillment_services: FulfillmentService[];
};

export type ShopifyFulfillment = {
  fulfillment: {
    id: number;
    order_id: number;
    status: string;
    created_at: string;
    service: string;
    updated_at: string;
    tracking_company: null | string;
    shipment_status: null | string;
    location_id: number;
    origin_address: null | string;
    line_items: {
      id: number;
      variant_id: number;
      title: string;
      quantity: number;
      sku: string;
      variant_title: string;
      vendor: string;
      fulfillment_service: string;
      product_id: number;
      requires_shipping: boolean;
      taxable: boolean;
      gift_card: boolean;
      name: string;
      variant_inventory_management: null | string;
      properties: string[];
      product_exists: boolean;
      fulfillable_quantity: number;
      grams: number;
      price: string;
      total_discount: string;
      fulfillment_status: string;
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
      total_discount_set: {
        shop_money: {
          amount: string;
          currency_code: string;
        };
        presentment_money: {
          amount: string;
          currency_code: string;
        };
      };
      discount_allocations: string[];
      duties: string[];
      admin_graphql_api_id: string;
      tax_lines: string[];
    }[];
    tracking_number: null | string;
    tracking_numbers: string[];
    tracking_url: null | string;
    tracking_urls: string[];
    receipt: Record<string, unknown>;
    name: string;
    admin_graphql_api_id: string;
  };
};
