import {decryptMsg} from "../../../utils/encryption";
import {ShopifyMerchant} from "../../types/merchants";
import {shopifyRequest} from "../../../networking/shopify";
import {WebhookSubscriptionData} from "../../types/shopify/webhooks";

/**
 * Creates a Shopify webhook and returns its ID based on the provided access token and shop.
 *
 * @param {string} access_token - The access token for Shopify API.
 * @param {string} shop - The Shopify shop name.
 * @returns {Promise<{ shop_update: number, complete_order_id: number}>} A promise that resolves to the ID of the created webhook.
 * @throws {Error} If there is an error creating the webhook or parsing the response.
 */
export const createWebhooksAndGetId = async (
  access_token: string,
  shop: string,
): Promise<{
  shop: number;
  order: number;
}> => {
  try {
    const complete_order_id = await createWebhook(
      access_token,
      shop,
      "orders/create",
      "pubsub://pod-bigly:pod-order-complete",
    );

    const shop_update_id = await createWebhook(
      access_token,
      shop,
      "shop/update",
      "pubsub://pod-bigly:shop-update",
    );

    return {
      shop: Number(shop_update_id),
      order: Number(complete_order_id),
    };
  } catch (error) {
    console.error("Error creating webhooks:", error);
    throw new Error("Failed to create webhooks");
  }
};

/**
 * Helper function to create a webhook.
 *
 * @param {string} access_token - The access token for Shopify API.
 * @param {string} shop - The Shopify shop name.
 * @param {string} topic - The topic for the webhook.
 * @param {string} address - The address where the webhook will send data.
 * @returns {Promise<number>} A promise that resolves to the webhook ID.
 * @throws {Error} If there is an error creating the webhook or parsing the response.
 */
const createWebhook = async (
  access_token: string,
  shop: string,
  topic: string,
  address: string,
): Promise<number> => {
  const payload = {
    webhook: {
      address,
      topic,
      format: "json",
    },
  };

  try {
    const response = await shopifyRequest(
      "webhooks.json",
      "POST",
      payload,
      access_token,
      shop,
    );
    const webhookData = response as WebhookSubscriptionData;
    return webhookData?.webhook?.id || 0;
  } catch (error) {
    console.error(`Error creating webhook for topic ${topic}:`, error);
    throw new Error(`Failed to create webhook for topic ${topic}`);
  }
};

/**
 * Deletes a webhook from the Shopify store associated with the provided merchant information.
 *
 * @param {ShopifyMerchant} merchant - The merchant's Shopify information, including webhook ID.
 * @returns {Promise<void>} A promise that resolves when the webhook is successfully deleted.
 * @throws {Error} If there is an error during the webhook deletion process.
 */
export const deleteWebhooks = async (
  merchant: ShopifyMerchant,
): Promise<void> => {
  try {
    const {order, shop} = merchant.webhooks;
    const access_token = await decryptMsg(merchant.access_token);
    const shop_name = merchant.shop_name;

    if (order && order > 0) {
      await deleteWebhookById(order, access_token, shop_name);
    }

    if (shop && shop > 0) {
      await deleteWebhookById(shop, access_token, shop_name);
    }

    console.log("Deleted WHs");
  } catch (error) {
    console.error("Error deleting webhooks:", error);
    throw new Error("Failed to delete webhooks");
  }
};

/**
 * Helper function to delete a webhook by ID.
 *
 * @param {number} webhookId - The ID of the webhook to delete.
 * @param {string} access_token - The access token for Shopify API.
 * @param {string} shop_name - The Shopify shop name.
 * @returns {Promise<void>} A promise that resolves when the webhook is successfully deleted.
 * @throws {Error} If there is an error deleting the webhook.
 */
const deleteWebhookById = async (
  webhookId: number,
  access_token: string,
  shop_name: string,
): Promise<void> => {
  try {
    await shopifyRequest(
      `webhooks/${webhookId}.json`,
      "DELETE",
      null,
      access_token,
      shop_name,
    );
  } catch (error) {
    console.error(`Error deleting webhook with ID ${webhookId}:`, error);
    throw new Error(`Failed to delete webhook with ID ${webhookId}`);
  }
};
