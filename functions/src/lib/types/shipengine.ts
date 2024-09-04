export interface ShipEngineResponse {
  rate_response: RateResponse;
  shipment_id: string;
  carrier_id: string;
  service_code: string | null;
  external_shipment_id: string | null;
  shipment_number: string | null;
  ship_date: string;
  created_at: string;
  modified_at: string;
  shipment_status: string;
  ship_to: ShipEngineAddress;
  ship_from: ShipEngineAddress;
  warehouse_id: string | null;
  return_to: ShipEngineAddress;
  is_return: boolean;
  confirmation: string;
  customs: Customs;
  external_order_id: string | null;
  order_source_code: string | null;
  advanced_options: AdvancedOptions;
  insurance_provider: string;
  tags: string[];
  packages: Package[];
  total_weight: {
    value: number;
    unit: string;
  };
  items: any[];
}

export type RateEstimatorRequestType = {
  rate_options: {
    carrier_ids: string[];
  };
  shipment: {
    validate_address: string;
    ship_to: {
      name: string;
      phone: string;
      company_name: string;
      address_line1: string;
      city_locality: string;
      state_province: string;
      postal_code: string;
      country_code: string;
      address_residential_indicator: string;
    };
    ship_from: {
      name: string;
      phone: string;
      company_name: string;
      address_line1: string;
      city_locality: string;
      state_province: string;
      postal_code: string;
      country_code: string;
      address_residential_indicator: string;
    };
    packages: {
      package_code: string;
      weight: {
        value: number;
        unit: string;
      };
    }[];
  };
};

interface RateAmount {
  currency: string;
  amount: number;
}

interface Rate {
  rate_id: string;
  rate_type: string;
  carrier_id: string;
  shipping_amount: RateAmount;
  insurance_amount: RateAmount;
  confirmation_amount: RateAmount;
  other_amount: RateAmount;
  rate_details: any[];
  zone: number;
  package_type: string;
  delivery_days: number;
  guaranteed_service: boolean;
  estimated_delivery_date: string;
  carrier_delivery_days: string;
  ship_date: string;
  negotiated_rate: boolean;
  service_type: string;
  service_code: string;
  trackable: boolean;
  carrier_code: string;
  carrier_nickname: string;
  carrier_friendly_name: string;
  validation_status: string;
  warning_messages: string[];
  error_messages: string[];
}

interface RateResponse {
  rates: Rate[];
  invalid_rates: any[];
  rate_request_id: string;
  shipment_id: string;
  created_at: string;
  status: string;
  errors: string[];
}

interface ShipEngineAddress {
  instructions: null;
  name: string;
  phone: string;
  company_name: string;
  address_line1: string;
  address_line2: null;
  address_line3: null;
  city_locality: string;
  state_province: string;
  postal_code: string;
  country_code: string;
  address_residential_indicator: string;
}

interface Customs {
  contents: string;
  contents_explanation: string | null;
  customs_items: any[];
  non_delivery: string;
  buyer_shipping_amount_paid: string | null;
  duties_paid: string | null;
  terms_of_trade_code: string | null;
  declaration: string | null;
  invoice_additional_details: {
    freight_charge: string | null;
    insurance_charge: string | null;
    other_charge: string | null;
    other_charge_description: string | null;
    discount: string | null;
  };
  importer_of_record: string | null;
}

interface AdvancedOptions {
  bill_to_account: null;
  bill_to_country_code: null;
  bill_to_party: null;
  bill_to_postal_code: null;
  contains_alcohol: boolean;
  delivered_duty_paid: boolean;
  non_machinable: boolean;
  saturday_delivery: boolean;
  dry_ice: boolean;
  dry_ice_weight: null;
  fedex_freight: null;
  third_party_consignee: boolean;
  ancillary_endorsements_option: null;
  freight_class: null;
  custom_field1: null;
  custom_field2: null;
  custom_field3: null;
  collect_on_delivery: null;
  return_pickup_attempts: null;
  additional_handling: boolean;
}

interface Package {
  shipment_package_id: string;
  package_id: string;
  package_code: string;
  package_name: string;
  weight: {
    value: number;
    unit: string;
  };
  dimensions: {
    unit: string;
    length: number;
    width: number;
    height: number;
  };
  insured_value: {
    currency: string;
    amount: number;
  };
  label_messages: {
    reference1: null;
    reference2: null;
    reference3: null;
  };
  external_package_id: null;
  content_description: null;
  products: any[];
}
