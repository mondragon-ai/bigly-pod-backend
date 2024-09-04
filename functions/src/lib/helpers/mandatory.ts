import * as crypto from "crypto";

/**
 * Verifies the authenticity of a Shopify webhook by comparing the provided HMAC header
 * with the computed hash based on the webhook data and the client secret.
 *
 * @param {Buffer} data - The webhook data as a Buffer.
 * @param {string} hmacHeader - The HMAC header sent with the webhook.
 * @returns {boolean} - Returns true if the webhook is valid; otherwise, false.
 */
export function verifyShopifyWebhook(
  data: Buffer,
  hmacHeader: string,
): boolean {
  const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || "";

  // Convert the object to a JSON string
  const jsonData = JSON.stringify(data);

  // Convert the JSON string to a Buffer
  const bufferData = Buffer.from(jsonData, "utf-8");

  const hash = crypto
    .createHmac("sha256", CLIENT_SECRET)
    .update(bufferData)
    .digest("base64");

  // Ensure hmacHeader and hash are of the same length
  if (hmacHeader.length !== hash.length) {
    return false;
  }

  // Validate
  return crypto.timingSafeEqual(Buffer.from(hmacHeader), Buffer.from(hash));
}
