import {MockupTypes} from "./generator";

export type MockupDocument = {
  id: string;
  domain: string;
  access_token: string;
  shop_name: string;
  design_url: string;
  base_sku: string;
  title: string;
  colors: string[];
  sizes: string[];
  type: MockupTypes;
  cost: number;
  state: number;
  created_at: FirebaseFirestore.Timestamp | Date;
  updated_at: FirebaseFirestore.Timestamp | Date;
  mockup_urls: {url: string; alt: string}[];
  status: "ACTIVE" | "DEACTIVE";
  product_id: string;
  dimension: MockupDimensions;
  position: {
    top: number;
    left: number;
  };
};

export type MockupDimensions = {
  original_width: number;
  original_height: number;
  resized_height: number;
  resized_width: number;
  blank_width: number;
  blank_height: number;
};

export type MockupPosition = {
  top: number;
  left: number;
};
