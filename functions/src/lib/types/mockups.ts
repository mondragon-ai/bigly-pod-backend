import {MockupSizeTypes} from "./generator";

export type MockupDocument = {
  is_shirt: boolean;
  front_is_main: boolean;
  external?: "SHOPIFY" | null;
  id: string;
  domain: string;
  brand: MockupBrands;
  access_token: string;
  shop_name: string;
  design_urls: {
    front: string;
    back: string;
    sleeve: string;
  };
  base_sku: string;
  title: string;
  colors: string[];
  sizes: MockupSizeTypes[];
  type: MockupTypes;
  cost: number;
  state: number;
  created_at: any;
  updated_at: any;
  mockup_urls: {front: MockupUrls[]; back: MockupUrls[]};
  status: "ACTIVE" | "DEACTIVE";
  product_id: string;
  dimension: MockupDimensions;
  position: MockupPosition;
  sleeve_side: "LEFT" | "RIGHT";
};

export type MockupUrls = {url: string; alt: string};

export type MockupTypes = "shirt_gilden" | "hoodie_lane_7";
export type MockupBrands = "GILDEN" | "LANE_7";

export type MockupDimensions = {
  original_width_front: number;
  original_height_front: number;
  resized_height_front: number;
  resized_width_front: number;
  original_width_back: number;
  original_height_back: number;
  resized_height_back: number;
  resized_width_back: number;
  blank_width: number;
  blank_height: number;
};

export type MockupPosition = {
  top_front: number;
  left_front: number;
  top_back: number;
  left_back: number;
};
