import {
  convertShopifyImagestoImages,
  convertShopifyVariantToVariant,
} from "./variants";
import {
  ShopifyProductResponse,
  ShopifyVariant,
} from "../types/shopify/products";
import * as admin from "firebase-admin";
import {MockupDocument} from "../types/mockups";
import {encryptMsg} from "../../utils/encryption";
import {MergedVariants, ProductDocument} from "../types/products";

/**
 * Generates a handle string for the Shopify product.
 *
 * @param {string} title - The product title.
 * @returns {string} The generated handle.
 */
const generateHandle = (title: string): string => {
  return title.toLowerCase().replace(" ", "-");
};

/**
 * Creates a product payload based on the fetched mockup.
 *
 * @param {MockupDocument} mockup - The fetched mockup document.
 * @param {ShopifyProductPayload} merchant_product - Merchant Shopify Product Payload.
 * @param {ShopifyProductPayload} pod_product - POD Shopify Product Payload.
 * @param {string} shpat - Shopify access token.
 * @returns {Promise<ProductDocument>} - The product document to be sent to Shopify.
 * @throws {Error} - Throws an error if the payload creation fails.
 */
export async function createProductPayload(
  mockup: MockupDocument,
  merchant_product: ShopifyProductResponse,
  pod_product: ShopifyProductResponse,
  shpat: string,
): Promise<ProductDocument> {
  try {
    const token = await encryptMsg(shpat);
    const {domain, base_sku, title, mockup_urls, sizes, colors, id, type} =
      mockup;
    const merged_variants = mergeVariants(
      merchant_product.product.variants,
      pod_product.product.variants,
    );

    const currentTime =
      admin.firestore && admin.firestore.Timestamp
        ? admin.firestore.Timestamp.now()
        : new Date();

    const variants =
      merchant_product.product.variants &&
      merchant_product.product.variants.map((v) =>
        convertShopifyVariantToVariant(v),
      );

    const images =
      merchant_product.product.images &&
      merchant_product.product.images.map((i) =>
        convertShopifyImagestoImages(i),
      );

    const payload: ProductDocument = {
      mockup_id: id,
      id: String(merchant_product.product.id),
      access_token: token,
      variants: variants,
      merged_variants,
      type,
      product_id: String(merchant_product.product.id || 0),
      pod_product_id: String(pod_product.product.id || 0),
      domain: domain || "",
      status: "ACTIVE",
      base_sku: base_sku || "",
      title: title || "",
      mockup_urls: mockup_urls || [],
      options: {
        options1: sizes || [],
        options2: colors || [],
        options3: [],
      },
      images: images,
      option1: "sizes",
      option2: "colors",
      option3: "",
      url: "",
      updated_at: currentTime,
      created_at: currentTime,
      cost: 22.0,
      requires_shipping: true,
      handle: generateHandle(title), // Utilize the new utility function
      weight: 85,
      quantity: 0,
      tags: ["BIGLY_POD"],
      collections: ["HATS"],
    };

    return payload;
  } catch (error) {
    throw new Error(
      `Failed to create product payload: ${(error as any).message}`,
    );
  }
}

/**
 * Merges merchant variants with corresponding pod variants based on SKU matching.
 *
 * @param {ShopifyVariant[]} merchant_variants - An array of merchant Shopify variants.
 * @param {ShopifyVariant[]} pod_variants - An array of POD (Print-on-Demand) Shopify variants.
 * @returns {MergedVariants[]} An array of objects containing IDs and SKUs of matched variants.
 */
export const mergeVariants = (
  merchant_variants: ShopifyVariant[],
  pod_variants: ShopifyVariant[],
): MergedVariants[] => {
  const newArray: MergedVariants[] = [];

  for (const merchant_variant of merchant_variants) {
    const matchingPodVariant = pod_variants.find(
      (pod_variant) => pod_variant.sku === merchant_variant.sku,
    );

    if (matchingPodVariant) {
      newArray.push({
        merchant_variants_id: merchant_variant.id,
        pod_variants_id: matchingPodVariant.id,
        SKU: merchant_variant.sku,
        cost: Number(
          (
            Math.round((Number(merchant_variant.price) / 2.5) * 100) / 100
          ).toFixed(2),
        ),
      });
    }
  }

  return newArray;
};
