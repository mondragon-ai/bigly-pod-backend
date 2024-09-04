import {shopifyRequest} from "../../../networking/shopify";
import {ShopData, ShopifyShop} from "../../types/shopify/shop";

/**
 * Fetches information about a Shopify merchant's shop using the provided access token and shop name.
 *
 * @param {string} access_token - The access token for Shopify API.
 * @param {string} shop - The Shopify shop name.
 * @returns {Promise<ShopData>} A promise that resolves to an object containing shop information.
 * @throws {Error} If there is an error fetching shop information or parsing the response.
 */
export const fetchShopifyMerchantShop = async (
  access_token: string,
  shop: string,
): Promise<ShopData> => {
  try {
    const response = (await shopifyRequest(
      "shop.json",
      "GET",
      null,
      access_token,
      shop,
    )) as ShopifyShop;

    const {
      domain,
      myshopify_domain,
      email,
      shop_owner,
      name,
      address1,
      city,
      province,
      zip,
      country,
      phone,
      iana_timezone,
    } = response.shop;

    return {
      domain,
      myshopify_domain,
      email,
      shop_owner,
      name,
      address: {
        address1: address1 || "",
        city: city || "",
        province: province || "",
        zip: zip || "",
        country: country || "",
      },
      phone: phone || "",
      timezone: iana_timezone,
    } as ShopData;
  } catch (error) {
    console.error("Error fetching Shopify merchant shop:", error);
    throw new Error("Failed to fetch Shopify merchant shop information");
  }
};
