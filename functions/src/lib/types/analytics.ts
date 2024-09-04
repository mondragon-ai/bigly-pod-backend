// Data fethced
export type AnalyticsProps = {
  id: string | number;
  total_orders: number;
  total_items: number;
  total_revenue: number;
  timezone: string;
  created_at: any;
  updated_at: any;
  orders: OrderAnalyticsProps[];
  top_sellers: TopSellersProps;
  top_types: Record<string, number>;
};

export type OrderAnalyticsProps = {
  id: string | number;
  created_at: number;
  total_items: number;
  total_price: number;
  fulfilled_date: number;
  fulfilled_time: number;
  shipping_cost: number;
};

export type TopSellersProps = {
  [key: string]: number;
};

// FOMRATTED DATE
export type TopSellerProps = {name: string; value: number};
export type DataProps = {date: string; value: number};

export type TimeFrameProps =
  | "seven_days"
  | "thirty_days"
  | "ninety_days"
  | "twelve_months";
