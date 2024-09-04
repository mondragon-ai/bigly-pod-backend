import {ShopifyCustomer} from "../../types/shopify/customers";
import {shopifyRequest} from "../../../networking/shopify";
import {Address} from "../../types/shopify/orders";
import * as functions from "firebase-functions";

/**
 * Creates a customer in the Shopify store with the provided shipping address and email.
 *
 * @param {Address} shipping_address - The shipping address for the customer.
 * @param {string} email - The email address of the customer.
 * @returns {Promise<ShopifyCustomer>} A Promise that resolves to the created Shopify customer data.
 */
export const createShopifyCustomer = async (
  shipping_address: Address,
  email: string,
): Promise<{customers: [{id: number}]}> => {
  const {address1, first_name, last_name, city, province, zip} =
    shipping_address;
  const access_key: string = process.env.SHOPIFY_BIGLY_POD || "";
  const shop = "bigly-pod";

  const payload = {
    customer: {
      first_name: first_name || "",
      last_name: last_name || "",
      email: email || "",
      phone: "",
      verified_email: true,
      addresses: [
        {
          address1: address1 || "",
          city: city || "",
          province: province || "",
          phone: "",
          zip: zip || "",
          last_name: "",
          first_name: first_name || "",
          country: "US",
          country_name: "United States",
          default: true,
        },
      ],
    },
  };

  const data = await shopifyRequest(
    "customers.json",
    "POST",
    payload,
    access_key,
    shop,
  );
  const customer = await checkStatus(data, email, access_key, shop);

  return customer;
};

/**
 * Checks the status of the customer creation process and returns customer data if successful or searches for an existing customer.
 *
 * @param {{ customer: ShopifyCustomer }} customer - The customer data returned from Shopify.
 * @param {string} email - The email address of the customer.
 * @param {string} access_key - The access key for making Shopify API requests.
 * @param {string} shop - The name of the Shopify shop.
 * @returns {Promise<ShopifyCustomer>} A Promise that resolves to the Shopify customer data.
 */
async function checkStatus(
  customer: {customer: ShopifyCustomer},
  email: string,
  access_key: string,
  shop: string,
): Promise<{customers: [{id: number}]}> {
  if (customer && customer.customer) {
    functions.logger.info("[SHOPIFY] -> 200 Created Customer");
    return {
      customers: [
        {
          id: customer.customer.id,
        },
      ],
    };
  } else {
    const customer = (await shopifyRequest(
      `customers/search.json?query=email:"${email}"&fields=id,email`,
      "GET",
      null,
      access_key,
      shop,
    )) as {customers: [{id: number}]};
    functions.logger.warn("[SHOPIFY] -> 422 Customer Found");

    return customer;
  }
}
