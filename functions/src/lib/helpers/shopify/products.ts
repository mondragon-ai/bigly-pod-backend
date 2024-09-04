import {convertColorForSKu} from "../../../utils/formatter";
import {shopifyRequest} from "../../../networking/shopify";
import {ProductDocument} from "../../types/products";
import {decryptMsg} from "../../../utils/encryption";
import * as functions from "firebase-functions";
import {
  ShopifyProductPayload,
  ShopifyProductResponse,
} from "../../types/shopify/products";

/**
 * Creates a product in Shopify.
 *
 * @async
 * @param {ShopifyProductPayload} productPayload - The Shopify product payload.
 * @param {string} accessToken - The access token for Shopify API.
 * @param {string} shop - The Shopify shop name.
 * @returns {Promise<ShopifyProductPayload>} The created Shopify product payload.
 */
export const createProductWithShopify = async (
  productPayload: ShopifyProductPayload,
  accessToken: string,
  shop: string,
): Promise<ShopifyProductResponse> => {
  return await shopifyRequest(
    "products.json",
    "POST",
    productPayload,
    accessToken,
    shop,
  );
};

/**
 * Adds images to Shopify product variants based on matching alt text and variant title.
 *
 * @param {ProductDocument} product - The product document containing variants & images.
 * @param {string} shpat - The access token for Shopify API authentication.
 * @param {string} shop - The Shopify shop name or domain.
 * @returns {Promise<{ variant: { id: string | number; image_id: string | number } }[]>} An array of objects containing variant and image IDs.
 */
export const addImagesToVariants = async (
  product: ProductDocument,
  shpat: string,
  shop: string,
): Promise<{variant: {id: string | number; image_id: string | number}}[]> => {
  try {
    const token = await decryptMsg(shpat);

    const promises = product.variants?.map((variant) => {
      const matchingImages = product.images.filter((image) =>
        variant.title
          .toLocaleLowerCase()
          .includes(convertColorForSKu(image.alt).toLocaleLowerCase()),
      );

      return Promise.all(
        matchingImages.map((image) =>
          shopifyRequest(
            `variants/${variant.variant_id}.json`,
            "PUT",
            {
              variant: {
                id: variant.variant_id,
                image_id: image.id,
              },
            },
            token,
            shop,
          )
            .then(() => ({
              variant: {
                id: variant.variant_id,
                image_id: image.id,
              },
            }))
            .catch((err) => {
              functions.logger.error({
                error: err,
                message: `Failed to update variant with ID ${variant.variant_id} for image ${image.id}`,
              });
              throw new Error(
                `Failed to update variant with ID ${variant.variant_id} for image ${image.id}`,
              );
            }),
        ),
      );
    });

    const imgs = (await Promise.all(promises || [])).flat();
    return imgs;
  } catch (error) {
    functions.logger.error({
      error,
      message: "Error in addImagesToVariants function",
    });
    throw new Error("Failed to add images to Shopify product variants.");
  }
};
