import {
  createRootDocument,
  updateRootDocument,
} from "../../../database/firestore";
import {ServicesReponseType, Status} from "../../../lib/types/shared";
import * as admin from "firebase-admin";
import {encryptMsg} from "../../../utils/encryption";
import {ShopifyMerchant} from "../../../lib/types/merchants";
import {
  createWebhooksAndGetId,
  deleteWebhooks,
} from "../../../lib/helpers/shopify/webhooks";
import {fetchShopifyMerchantShop} from "../../../lib/helpers/shopify/shop";
import {merchantPayload} from "../../../lib/payloads/merchant";
import {createFulfillmentService} from "../../../lib/helpers/shopify/fulfillment";
import {fetchMerchantFromDB} from "../../../database/merchant";

/**
 * Generates a standard response object
 * @param {number} status - HTTP status code.
 * @param {any} data - Response data.
 * @param {boolean} error - Error flag.
 * @param {string} text - Response message.
 * @returns {ServicesReponseType} A response object.
 */
const createResponse = (
  status: Status,
  data: any = null,
  error: boolean,
  text: string,
): ServicesReponseType => ({
  status,
  data,
  error,
  text,
});

/**
 * Validates the required parameters
 * @param {string} domain - Merchant domain.
 * @param {string} shpat - Shopify access token.
 * @returns {string | null} Error message or null.
 */
const validateInstallAppParams = (
  domain: string,
  shpat: string,
): string | null => {
  if (!domain || domain.trim() === "") return "Merchant domain is required.";
  if (!shpat || shpat.trim() === "") return "SHPAT is required.";
  return null;
};

// ! ====================================================================================================================================
// ! Install
// ! ====================================================================================================================================
/**
 * install app to Shopify merchant
 *
 * @returns {Promise<ServicesReponseType>} An object containing the status, data, error flag, and status text related to the fetch operation.
 */
export const installApp = async (
  domain: string,
  shpat: string,
): Promise<ServicesReponseType> => {
  const shop = domain.split(".")[0];
  const validationError = validateInstallAppParams(domain, shpat);
  if (validationError) {
    return createResponse(400, null, true, validationError);
  }

  let res = createResponse(
    204,
    null,
    false,
    "App updated for Merchant successfully",
  );
  const token = await encryptMsg(shpat);

  try {
    // fetch merchant
    const merchant = await fetchMerchantFromDB(domain);

    if (
      merchant &&
      merchant.installed &&
      merchant &&
      token !== merchant.access_token
    ) {
      console.log("updating...");
      await handleMerchantInstalled(merchant, shop, shpat, token, domain);
    } else if (!merchant || !merchant.installed) {
      console.log("installing...");
      res = await handleMerchantNotInstalled(shop, shpat, domain, token);
    }
  } catch (error) {
    console.error("Error installing app:", error); // Log error for debugging
    res = createResponse(
      500,
      null,
      true,
      "Failed to install app for the merchant.",
    );
  }

  return res;
};

/**
 * Handles the necessary updates when a Shopify merchant has installed an app.
 * This function deletes any existing webhooks and creates new ones, updating the merchant's document with the new information.
 * @param {ShopifyMerchant} merchant - The merchant's data.
 * @param {string} shop - The merchant's shop name.
 * @param {string} shpat - Shopify API token.
 * @param {string} token - New access token.
 * @param {string} domain - The merchant's domain.
 */
const handleMerchantInstalled = async (
  merchant: ShopifyMerchant,
  shop: string,
  shpat: string,
  token: string,
  domain: string,
) => {
  await deleteWebhooks(merchant);
  const webhooks = await createWebhooksAndGetId(shpat, shop);
  await updateRootDocument("shopify_pod", domain, {
    access_token: token,
    webhooks: {
      order: webhooks.order || 0,
      shop: webhooks.shop || 0,
    },
    updated_at: admin.firestore.Timestamp.now(),
  });
};

/**
 * Handles the workflow for when a Shopify merchant has not installed the app.
 * This function creates necessary webhooks, fetches the merchant shop data, creates a fulfillment service,
 * and initializes a document for the merchant with all relevant data.
 * @param {string} shop - The merchant's shop name.
 * @param {string} shpat - Shopify API token.
 * @param {string} domain - The merchant's domain.
 * @param {string} token - New access token.
 * @returns {Promise<{status: Status; data: any; error: boolean; text: string}>} - Returns a response object detailing the outcome.
 */
const handleMerchantNotInstalled = async (
  shop: string,
  shpat: string,
  domain: string,
  token: string,
): Promise<{status: Status; data: any; error: boolean; text: string}> => {
  const webhooks = await createWebhooksAndGetId(shpat, shop);
  const store = await fetchShopifyMerchantShop(shpat, shop);
  const fulfillment = await createFulfillmentService(shop, shpat);
  const payload = merchantPayload(token, webhooks, store, fulfillment);

  await createRootDocument("domain_map", domain, {
    myshopify_domain: store.myshopify_domain,
    custom_domain: store.domain,
    id: domain,
  });

  const {status, text} = await createRootDocument(
    "shopify_pod",
    domain,
    payload,
  );

  if (status < 300) {
    return createResponse(
      status,
      null,
      true,
      "Merchant could not be saved successfully - " + text,
    );
  }

  return createResponse(
    201,
    payload,
    false,
    "App installed for Merchant successfully",
  );
};

// ! ====================================================================================================================================
// ! Billing
// ! ====================================================================================================================================

/**
 * Validates the required parameters for billing
 * @param {string} domain - Merchant domain.
 * @returns {string | null} Error message or null.
 */
const validateBillingParams = (domain: string): string | null => {
  if (!domain || domain.trim() === "") return "Merchant domain is required.";
  return null;
};

/**
 * Update the billing for the app (approve the app or increase cap monthly limit)
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @param {"DECLINED" | "ACTIVE" | "EXPIRED"} payent_status - App payment status.
 * @param {nujmber} capped_limit - Updated cappage limit for billing.
 * @returns {Promise<ServicesReponseType>} An object containing the status, error flag, and status text related to the delete operation.
 */
export const updateBilling = async (
  domain: string,
  payent_status: "DECLINED" | "ACTIVE" | "EXPIRED",
  capped_limit: number,
): Promise<ServicesReponseType> => {
  const validationError = validateBillingParams(domain);
  if (validationError) {
    return createResponse(400, null, true, validationError);
  }

  let res = createResponse(
    204,
    null,
    false,
    "App billing for Merchant updated successfully",
  );

  const currentTime =
    admin.firestore && admin.firestore.Timestamp
      ? admin.firestore.Timestamp.now()
      : new Date();

  try {
    // Perform billing update tasks
    const {status, text} = await updateRootDocument("shopify_pod", domain, {
      status: payent_status ?? "DECLINED",
      capped_usage: capped_limit,
      updated_at: currentTime,
    });

    if (status < 300) {
      res = createResponse(
        status,
        null,
        true,
        "Failed to update billing for the merchant." + text,
      );
    }
  } catch (error) {
    console.error("Error updating billing:", error);
    res = createResponse(
      500,
      null,
      true,
      "Failed to update billing for the merchant.",
    );
  }

  return res;
};
