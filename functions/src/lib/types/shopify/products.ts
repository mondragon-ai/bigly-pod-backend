export type ShopifyVariants = {
  id: string;
  title: string;
  option1: "Small" | "Medium" | "Large" | "XL" | "2XL" | "3XL" | "4XL" | "5XL";
  option2: string;
  option3: string;
  price: number;
  sku: string;
  weight: number;
  weight_unit: "lb" | "g";
  requires_shipping: boolean;
  inventory_policy: "continue" | null;
  cost: number;
  fulfillment_service: "manual" | "biglypod-fulfillment";
};

export type ShopifyProductImages = {
  id: number;
  src: string;
  alt: string;
  position?: number;
  product_id?: number;
  created_at?: string;
  updated_at?: string;
  admin_graphql_api_id?: string;
  width?: number;
  height?: number;
  variant_ids?: number[];
};

export type ShopifyProductOptions = {
  id?: number;
  product_id?: number;
  name: string;
  position?: number;
  values: string[];
};

export type ShopifyProductPayload = {
  product: {
    id?: number | string;
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    tags: string[];
    handle: string;
    status: string;
    published_scope: string;
    variants: ShopifyVariant[];
    options: {
      name: string;
      values: string[];
    }[];
    images: ShopifyProductImages[];
  };
};

export type ShopifyVariant = {
  id: string;
  title: string;
  price: number;
  sku: string;
  weight: number;
  weight_unit: string;
  requires_shipping: boolean;
  inventory_policy: "continue" | null;
  cost: number;
  fulfillment_service: "manual" | "biglypod-fulfillment";
  product_id: number;
  position: number;
  compare_at_price: string | null;
  option1: string;
  option2: string;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  inventory_management: string | null;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  admin_graphql_api_id: string;
  image_id: number | null;
};

export type ShopifyProductResponse = {
  product: {
    id: number;
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    created_at: string;
    handle: string;
    updated_at: string;
    published_at: string;
    template_suffix: string | null;
    published_scope: string;
    tags: string;
    status: string;
    admin_graphql_api_id: string;
    variants: ShopifyVariant[];
    options: ShopifyProductOptions[];
    images: ShopifyProductImages[];
    image: ShopifyProductImages;
  };
};
