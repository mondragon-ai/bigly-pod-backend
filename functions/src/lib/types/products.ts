import {MockupTypes} from "./generator";

export type ProductDocument = {
  type: MockupTypes;
  mockup_id: string;
  product_id: string;
  pod_product_id: string;
  id: string;
  domain: string;
  access_token: string;
  status: "ACTIVE" | "DEACTIVE";
  base_sku: string;
  title: string;
  mockup_urls: {url: string; alt: string}[];
  options: {
    options1: string[];
    options2: string[];
    options3: string[];
  };
  option1: "sizes";
  option2: "colors";
  option3: string;
  images: ImagesProps[];
  url: string;
  updated_at: FirebaseFirestore.Timestamp | Date;
  created_at: FirebaseFirestore.Timestamp | Date;
  variants: Variant[];
  cost: number;
  requires_shipping: boolean;
  handle: string;
  weight: number;
  quantity: number;
  tags: string[];
  collections: string[];
  merged_variants: MergedVariants[];
};

export type ImagesProps = {
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type MergedVariants = {
  merchant_variants_id: string;
  pod_variants_id: string;
  SKU: string;
  cost: number;
};

export type SubVariant = {
  pod_id: string | number;
  merchant_id: string | number;
};

export interface Variant {
  product_id: string;
  variant_id: string;
  sku: string;
  price: number;
  option1: string;
  option2: string;
  option3: string;
  title: string;
  weight_unit: "g";
  requires_shipping: boolean;
  fulfillment_service: string;
  inventory_policy: "continue";
  cost: number;
  weight: number;
}
