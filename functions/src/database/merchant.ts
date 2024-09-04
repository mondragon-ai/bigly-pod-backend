import {fetchRootDocument} from "./firestore";
import {ShopifyMerchant} from "../lib/types/merchants";

/**
 * Fetches a merchant's data from the Firestore database using the specified domain.
 * @param {string} domain - The domain identifier for the merchant.
 * @returns {Promise<ShopifyMerchant | null>} The merchant's data if available, or null if no data is found.
 */
export const fetchMerchantFromDB = async (
  domain: string,
): Promise<ShopifyMerchant | null> => {
  const {data} = await fetchRootDocument("shopify_pod", domain);
  if (!data) {
    return null;
  }
  return data as ShopifyMerchant;
};
