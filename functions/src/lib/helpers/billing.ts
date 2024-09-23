import {shopifyGraphQlRequest} from "../../networking/shopify";
import {PODLineItemsProps} from "../types/orders";
import {decryptMsg} from "../../utils/encryption";
import * as functions from "firebase-functions";
import {
  CurrentAppInstallType,
  ShopifyCreateUsageChargeResponse,
  SubscriptionLineItem,
} from "../types/shopify/billing";

/**
 * Updates the merchant's usage and creates a usage record in Shopify for mockup generation costs.
 *
 * @param {string} access_token - The access token for making Shopify API requests.
 * @param {Array<{ variant_id: string; quantity: number; weight: number; cost: number }>} line_items - An array of line items.
 * @param {string} myshopify_domain - The Shopify domain.
 * @param {number} shipping_rate - The shipping rate.
 * @returns {Promise<{ capacityReached: boolean; createdRecord: boolean }>} A promise that resolves to an object with `capacityReached` and `createdRecord` flags.
 */
export const updateMerchantUsage = async (
  access_token: string,
  line_items: PODLineItemsProps[],
  myshopify_domain: string,
  shipping_rate: number,
  is_wholesale = false,
): Promise<{capacityReached: boolean; createdRecord: boolean}> => {
  const quantity = line_items.reduce(
    (total, item) => total + Number(item.quantity),
    0,
  );

  let totalCost = calculateTotalCost(line_items, shipping_rate);
  if (is_wholesale) {
    const discount = quantity >= 25 ? 0.95 : 0;
    totalCost *= discount;
  }
  const token = await decryptMsg(access_token);
  const shop = myshopify_domain.split(".")[0];

  return createUsageRecord(
    shop,
    token,
    totalCost,
    "Usage charges apply per item sold that is generated using the mockup from the app, starting at $11.",
  );
};

/**
 * Calculates the total cost based on line items and shipping rate.
 *
 * @param {Array<{ variant_id: string; quantity: number; weight: number; cost: number }>} line_items - An array of line items.
 * @param {number} shipping_rate - The shipping rate.
 * @returns {number} The total calculated cost.
 */
export function calculateTotalCost(
  line_items: PODLineItemsProps[],
  shipping_rate: number,
): number {
  return line_items.reduce(
    (total, item) => total + Number(Number(item.cost) * Number(item.quantity)),
    shipping_rate + 2.0,
  );
}

/**
 * Calculates the total cost based on line items and shipping rate.
 *
 * @param {Array<{ variant_id: string; quantity: number; weight: number; cost: number }>} line_items - An array of line items.
 * @param {number} shipping_rate - The shipping rate.
 * @returns {number} The total calculated cost.
 */
export function calculateTotalRevenue(line_items: PODLineItemsProps[]): number {
  return line_items.reduce((total, item) => {
    const gross = Number(item.price) * Number(item.quantity);
    return total + Number(gross);
  }, 0);
}

interface BillingPlan {
  amount: number;
  currencyCode: string;
  interval: string;
  terms: string;
}

export const billingConfig: {[key: string]: BillingPlan} = {
  "Pay As You Go": {
    amount: 5000,
    currencyCode: "USD",
    interval: "USAGE",
    terms:
      "Usage charges apply per item sold that is generated using the mockup from the app, starting at $11.",
  },
};

const HAS_PAYMENTS_QUERY = {
  query: `query appSubscription {
        currentAppInstallation {
            activeSubscriptions {
                id
                name
                lineItems {
                    id
                    plan {
                        pricingDetails {
                            __typename
                            ... on AppUsagePricing {
                                terms
                                balanceUsed { amount }
                                cappedAmount { amount }
                            }
                        }
                    }
                }
            }
        }
    }`,
};

/**
 * Creates a usage record in Shopify if the usage capacity has not been reached.
 *
 * @param {string} shop - The Shopify shop name.
 * @param {string} access_token - The access token for Shopify API.
 * @param {number} usageChargeIncrementAmount - The amount to increment the usage charge.
 * @param {string} planDescription - The description of the plan.
 * @returns {Promise<{ capacityReached: boolean; createdRecord: boolean }>} A promise that resolves whencapacity was reached and if the record was created.
 */
export async function createUsageRecord(
  shop: string,
  access_token: string,
  usageChargeIncrementAmount: number,
  planDescription: string,
): Promise<{capacityReached: boolean; createdRecord: boolean}> {
  try {
    const subscriptionLineItem = await getAppSubscription(
      shop,
      access_token,
      planDescription,
    );

    // console.log({subscriptionLineItem});

    if (!subscriptionLineItem) {
      return {capacityReached: false, createdRecord: false};
    }
    if (
      subscriptionLineItem.balanceUsed + usageChargeIncrementAmount >
      subscriptionLineItem.cappedAmount
    ) {
      return {capacityReached: true, createdRecord: false};
    }

    return await attemptCreateUsageRecord(
      shop,
      access_token,
      subscriptionLineItem,
      usageChargeIncrementAmount,
    );
  } catch (error) {
    functions.logger.error("Error creating usage record:", error);
    return {capacityReached: false, createdRecord: false};
  }
}

/**
 * Attempts to create a usage record in Shopify.
 *
 * @param {string} shop - The Shopify shop name.
 * @param {string} access_token - The access token for Shopify API.
 * @param {SubscriptionLineItem} subscriptionLineItem - The subscription line item.
 * @param {number} usageChargeIncrementAmount - The amount to increment the usage charge.
 * @returns {Promise<{ capacityReached: boolean; createdRecord: boolean }>} A promise that resolves to an object indicating whether the capacity was reached and if the record was created.
 */
async function attemptCreateUsageRecord(
  shop: string,
  access_token: string,
  subscriptionLineItem: SubscriptionLineItem,
  usageChargeIncrementAmount: number,
): Promise<{capacityReached: boolean; createdRecord: boolean}> {
  const res = {
    capacityReached: false,
    createdRecord: false,
  };

  if (
    subscriptionLineItem.balanceUsed + usageChargeIncrementAmount >
    subscriptionLineItem.cappedAmount
  ) {
    res.capacityReached = true;
    return res;
  }

  console.log({usageChargeIncrementAmount});

  try {
    const createUsageRecordMutation = {
      query: `mutation appUsageRecordCreate(
                $description: String!,
                $price: MoneyInput!,
                $subscriptionLineItemId: ID!
            ) {
                appUsageRecordCreate(
                    description: $description,
                    price: $price,
                    subscriptionLineItemId: $subscriptionLineItemId
                ) {
                    appUsageRecord { id }
                    userErrors { field message }
                }
            }`,
      variables: {
        description: billingConfig["Pay As You Go"].terms,
        price: {
          amount: usageChargeIncrementAmount,
          currencyCode: "USD",
        },
        subscriptionLineItemId: subscriptionLineItem.id,
      },
    };
    // console.log({createUsageRecordMutation});

    const repsonse = (await shopifyGraphQlRequest(
      shop,
      access_token,
      createUsageRecordMutation,
    )) as ShopifyCreateUsageChargeResponse;

    if (repsonse.data.appUsageRecordCreate.appUsageRecord.id !== "") {
      res.createdRecord = true;
      functions.logger.info("Usage record created successfully.");
    }
  } catch (error) {
    functions.logger.error("Error while creating usage record:", error);
  }

  return res;
}

/**
 * Retrieves the subscription line item from Shopify.
 *
 * @param {string} shop - The Shopify shop name.
 * @param {string} access_token - The access token for Shopify API.
 * @param {string} planDescription - The description of the plan.
 * @returns {Promise<SubscriptionLineItem>} A promise that resolves to the subscription line item.
 */
export async function getAppSubscription(
  shop: string,
  access_token: string,
  planDescription: string,
): Promise<SubscriptionLineItem> {
  try {
    const response: CurrentAppInstallType = await shopifyGraphQlRequest(
      shop,
      access_token,
      HAS_PAYMENTS_QUERY,
    );

    /* eslint-disable operator-linebreak */
    for (const subscription of response.data.currentAppInstallation
      .activeSubscriptions) {
      if (subscription.name === "Pay As You Go") {
        for (const lineItem of subscription.lineItems) {
          if (
            lineItem.plan.pricingDetails.terms === planDescription ||
            lineItem.plan.pricingDetails.terms ===
              "Between $10.50 and 16.75 per mockup\n"
          ) {
            return {
              id: lineItem.id,
              balanceUsed: parseFloat(
                lineItem.plan.pricingDetails.balanceUsed.amount,
              ),
              cappedAmount: parseFloat(
                lineItem.plan.pricingDetails.cappedAmount.amount,
              ),
            };
          }
        }
      }
    }
    /* eslint-enable operator-linebreak */
  } catch (error) {
    functions.logger.error("Error fetching app subscription:", error);
  }

  return {} as SubscriptionLineItem;
}
