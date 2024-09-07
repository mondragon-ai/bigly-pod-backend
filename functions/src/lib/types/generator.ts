export type MockupRequestBody = {
  base_sku: string;
  title: string;
  colors: ("WHITE" | "BLACK" | "GREEN" | "BLUE" | "GRAY")[];
  sizes: MockupSizeTypes[];
  blank_image: string;
  type: MockupTypes;
  cost: number;
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
  mockups: string[];
  design_urls: {
    front: string;
    back: string;
    sleeve: string;
  };
  dimension: MockupDimensions;
  position: MockupPosition;
  is_shirt: boolean;
  front_is_main: boolean;
  sides: ("FRONT" | "BACK")[];
  sleeve_side: "LEFT" | "RIGHT";
};

export type MockupColors = "WHITE" | "BLACK" | "GREEN" | "BLUE" | "GRAY";

export type MockupSizeTypes =
  | "SMALL"
  | "MEDIUM"
  | "LARGE"
  | "XL"
  | "2XL"
  | "3XL"
  | "4XL"
  | "5XL";

export type MockupDimensions = {
  original_width_front: number;
  original_height_front: number;
  resized_height_front: number;
  resized_width_front: number;
  original_width_back: number;
  original_height_back: number;
  resized_height_back: number;
  resized_width_back: number;
  original_width_sleeve: number;
  original_height_sleeve: number;
  resized_height_sleeve: number;
  resized_width_sleeve: number;
  blank_width: number;
  blank_height: number;
};

export type MockupPosition = {
  top_front: number;
  left_front: number;
  top_back: number;
  left_back: number;
};

export type MockupTypes = "shirt_gilden" | "hoodie_lane_7";
export type MockupBrands = "GILDEN" | "LANE_7";

export type ProductCreateReqBody = {
  domain: string;
  sku: string;
  id: string;
  access_token: string;
  external: string;
};

export type DesignUrl = {
  url: string;
  alt: string;
};
