import {
  RateEstimatorRequestType,
  ShipEngineResponse,
} from "../types/shipengine";
import * as functions from "firebase-functions";
import {Address} from "../types/shopify/orders";
import {PODLineItemsProps} from "../types/orders";
import {shipEngineAPIRequests} from "../../networking/shipEngine";

/**
 * Generates shipping rates for a shipment based on the provided shipping address and line items.
 *
 * @param {Address} shipping - The shipping address for the shipment.
 * @param {{ variant_id: string, quantity: number, weight: number }[]} line_item - An array of line items
 * @returns {Promise<number>} The shipping rate price in the currency of the carrier.
 */
export const generateShippingRates = async (
  shipping: Address,
  line_item: PODLineItemsProps[],
): Promise<number> => {
  const grams = sumTotalWeight(line_item);

  const payload: RateEstimatorRequestType = {
    rate_options: {
      carrier_ids: ["se-3347170"],
    },
    shipment: {
      validate_address: "no_validation",
      ship_to: {
        name: `${shipping.first_name || ""} ${shipping.last_name || ""}`,
        phone: shipping.phone || "",
        company_name: "",
        address_line1: shipping.address1 || "",
        city_locality: shipping.city || "",
        state_province: shipping.province || "",
        postal_code: shipping.zip || "",
        country_code: shipping.country || "US",
        address_residential_indicator: "no",
      },
      ship_from: {
        name: "Bigly POD",
        phone: "5012406984",
        company_name: "Bigly",
        address_line1: "3049 North College Avenue",
        city_locality: "Fayetteville",
        state_province: "AR",
        postal_code: "72703",
        country_code: "US",
        address_residential_indicator: "no",
      },
      packages: [
        {
          package_code: "package",
          weight: {
            value: grams * 0.03527396195,
            unit: "ounce",
          },
        },
      ],
    },
  };

  const response = (await shipEngineAPIRequests(
    "/rates",
    "POST",
    payload,
  )) as ShipEngineResponse;
  if (!response) {
    functions.logger.error("Generating Shipping Rates: rate_estimator.ts");
    return 0;
  }

  return calculateRate(response);
};

/**
 * Calculates the total weight in grams of a list of line items.
 *
 * @param {{ variant_id: string, quantity: number, weight: number }[]} line_item - An array of line items
 * @returns {number} The total weight in grams.
 */
export const sumTotalWeight = (
  line_item: {variant_id: string; quantity: number; weight: number}[],
): number => {
  return line_item.reduce((total, li) => total + li.weight, 0);
};

/**
 * Calculates the best shipping rate from a ShipEngine response.
 *
 * @param {ShipEngineResponse} response - The ShipEngine response containing shipping rates.
 * @returns {number} The best shipping rate price in the currency of the carrier.
 */
export const calculateRate = (response: ShipEngineResponse): number => {
  let rate_price = 0;
  for (const rate of response.rate_response.rates) {
    if (rate_price === 0 || rate.service_type === "USPS Ground Advantage") {
      rate_price = Number(rate.shipping_amount.amount);
    } else {
      rate_price = Math.min(rate_price, Number(rate.shipping_amount.amount));
    }
  }
  return rate_price;
};
