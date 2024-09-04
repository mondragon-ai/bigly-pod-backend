import {fetchRootDocument} from "../../database/firestore";
import {ShopifyMerchant} from "../types/merchants";

/**
 * Fetches the Shopify merchant information based on the provided order status URL.
 *
 * @param {string} order_status_url - The order status URL containing the shop's domain.
 * @returns {Promise<{ merchant: ShopifyMerchant | null, domain: string }>} An object containing the merchant information and the domain, or null if not found.
 */
export const fetchMerchant = async (
  order_status_url: string,
): Promise<{merchant: ShopifyMerchant | null; domain: string}> => {
  const shop = order_status_url.replace("https://", "");
  const domains = [`${shop.split(".")[0]}.myshopify.com`, shop.split("/")[0]];
  let doc_id = "";
  let merchant: ShopifyMerchant | null = null;

  for (const domain of domains) {
    const {data: map} = await fetchRootDocument("domain_map", domain);
    if (!map) continue;

    const {data} = await fetchRootDocument("shopify_pod", map.myshopify_domain);
    if (data) {
      merchant = data;
      doc_id = map.myshopify_domain;
      break;
    }
  }

  return {
    merchant,
    domain: doc_id,
  };
};
