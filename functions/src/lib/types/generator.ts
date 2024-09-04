export type MockupRequestBody = {
  design_url: string;
  base_sku: string;
  title: string;
  colors: ("WHITE" | "BLACK" | "GREEN" | "BLUE" | "GRAY")[];
  sizes: (
    | "Small"
    | "Medium"
    | "Large"
    | "XL"
    | "2XL"
    | "3XL"
    | "4XL"
    | "5XL"
  )[];
  blank_image: string;
  type: MockupTypes;
  cost: number;
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
  mockups: string[];
  dimension: {
    original_width: number;
    original_height: number;
    resized_height: number;
    resized_width: number;
    blank_width: number;
    blank_height: number;
  };
  position: {
    top: number;
    left: number;
  };
  resized_design: string;
};

export type MockupTypes = "hoodie_lane_7" | "shirt_gilden";

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
