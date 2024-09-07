import {
  ShopifyProductImages,
  ShopifyProductOptions,
  ShopifyProductPayload,
  ShopifyVariants,
} from "../../types/shopify/products";
import {MockupDocument} from "../../types/mockups";
import {generateRandomID} from "../../../utils/generator";
import {convertColorForSKu, convertSizeForSKU} from "../../../utils/formatter";
import {MockupSizeTypes} from "../../types/generator";

/**
 * Generates a SKU string based on the mockup data.
 *
 * @param {MockupDocument} mockup - The Mockup document.
 * @returns {string} The generated SKU.
 */
const generateSKU = (mockup: MockupDocument): string => {
  return mockup.base_sku && mockup.base_sku !== ""
    ? mockup.base_sku
    : mockup.title.toLowerCase().replace(" ", "-");
};

/**
 * Generates a handle string for the Shopify product.
 *
 * @param {string} title - The product title.
 * @returns {string} The generated handle.
 */
const generateHandle = (title: string): string => {
  return title.replace(" ", "-");
};

/**
 * Generates Shopify variants based on product data and configuration.
 *
 * @param {MockupDocument} mockup - The Mockup document from FS.
 * @param {boolean} is_pod - Indicates whether the product is for Print-on-Demand.
 * @returns {ShopifyVariants[]} An array of Shopify variants.
 */
export const generateShopifyProductVariants = (
  mockup: MockupDocument,
  is_pod: boolean,
): ShopifyVariants[] => {
  const {is_shirt, design_urls} = mockup;
  const variants: ShopifyVariants[] = [];
  const SKU = generateSKU(mockup);
  const has_sleeve = design_urls.sleeve !== "";
  const has_back = design_urls.back !== "";
  const has_front = design_urls.front !== "";

  if (mockup.colors && mockup.colors.length > 0) {
    for (const size of mockup.sizes) {
      const weight = calculateShopifyVariantWeight(is_shirt, size);
      for (const color of mockup.colors) {
        if (
          (size == "4XL" && is_shirt && color == "GREEN") ||
          (size == "5XL" && is_shirt && color == "GREEN") ||
          (size == "5XL" && is_shirt && color == "BLUE")
        ) {
          continue;
        }
        const cost = calculateShopifyVariantCost(
          is_shirt,
          has_sleeve,
          has_front,
          has_back,
          size,
        );
        variants.push({
          option1: size || "",
          option2: convertColorForSKu(color) || "",
          option3: "",
          price: is_pod
            ? Number(Math.floor(cost).toFixed(2))
            : Number(Math.floor(cost * 2.5).toFixed(2)),
          sku: SKU + `-${convertSizeForSKU(size)}-${convertColorForSKu(color)}`,
          weight: weight,
          weight_unit: "g",
          requires_shipping: true,
          inventory_policy: "continue",
          cost: cost,
          fulfillment_service: is_pod ? "manual" : "biglypod-fulfillment",
        } as ShopifyVariants);
      }
    }
  }

  return variants;
};

/**
 * Generates a list of Shopify product images based on the provided design information and mockup URLs.
 *
 * @param {MockupDocument} mockup - The mockup document containing design information (FS).
 * @returns {ShopifyProductImages[]} A list of Shopify product images with source URLs and alt text.
 */
export const generateShopifyProductImageList = (
  mockup: MockupDocument,
): ShopifyProductImages[] => {
  const images: ShopifyProductImages[] = [];

  // Helper function to push image data to imgs array
  const pushImage = (src: string, alt: string) => {
    images.push({src, alt, id: Number(generateRandomID(""))});
  };

  mockup.mockup_urls[mockup.front_is_main ? "front" : "back"].forEach((img) => {
    pushImage(img.url, img.alt);
  });

  for (const design_url of Object.entries(mockup.design_urls)) {
    if (design_url[1] !== "") {
      pushImage(design_url[1], `${design_url[0]}_design`);
    }
  }

  return images;
};

/**
 * Generates Shopify product options based on mockup data.
 *
 * @param {MockupDocument} mockup - The mockup data from the database.
 * @returns {ShopifyProductOptions[]} The generated Shopify product options.
 */
export const generateShopifyProductOptions = (
  mockup: MockupDocument,
): ShopifyProductOptions[] => {
  const optionNames = ["sizes", "colors"];
  const options: ShopifyProductOptions[] = [];

  optionNames.forEach((optionName) => {
    const values = mockup[optionName as keyof MockupDocument];

    options.push({
      name: optionName || "",
      values: values ? (values as string[]) : [],
    });
  });

  return options;
};

/**
 * Creates a Shopify product payload object based on the provided product information, variants, images, and options.
 *
 * @param {MockupDocument} mockup - The product document containing product information.
 * @param {ShopifyVariants[]} variants - An array of Shopify product variants.
 * @param {ShopifyProductImages[]} images - An array of Shopify product images.
 * @param {ShopifyProductOptions[]} options - An array of Shopify product options.
 * @returns {ShopifyProductPayload} A Shopify product payload object.
 */
export const createShopifyProductPayload = (
  mockup: MockupDocument,
  variants: ShopifyVariants[],
  images: ShopifyProductImages[],
  options: ShopifyProductOptions[],
): ShopifyProductPayload => {
  const {title} = mockup;

  return {
    product: {
      variants: variants,
      title: title || "",
      body_html: "",
      vendor: "BIGLY",
      product_type: "Apparel",
      tags: ["POD"],
      handle: generateHandle(title), // Util function to create handle
      status: "active",
      published_scope: "global",
      options: options,
      images: images,
    },
  } as ShopifyProductPayload;
};

/**
 * Calculates the cost for a Shopify variant based on various factors.
 *
 * @param {boolean} is_shirt - Indicates whether the product is a shirt.
 * @param {Variant} el - The variant data.
 * @returns {number} The calculated cost for the variant.
 */
export const calculateShopifyVariantWeight = (
  is_shirt: boolean,
  size: MockupSizeTypes,
) => {
  /* eslint-disable indent */
  const weight =
    is_shirt && size == "SMALL"
      ? 113.4
      : is_shirt && size == "MEDIUM"
      ? 127.6
      : is_shirt && size == "LARGE"
      ? 153.1
      : is_shirt && size == "XL"
      ? 170.1
      : is_shirt && size == "2XL"
      ? 192.8
      : is_shirt && size == "3XL"
      ? 209.8
      : is_shirt && size == "4XL"
      ? 224.0
      : is_shirt && size == "5XL"
      ? 252.3
      : !is_shirt && size == "SMALL"
      ? 453.6
      : !is_shirt && size == "MEDIUM"
      ? 518.8
      : !is_shirt && size == "LARGE"
      ? 544.3
      : !is_shirt && size == "XL"
      ? 598.2
      : !is_shirt && size == "2XL"
      ? 623.7
      : !is_shirt && size == "3XL"
      ? 691.7
      : !is_shirt && size == "4XL"
      ? 733.2
      : !is_shirt && size == "5XL"
      ? 779.3
      : !is_shirt
      ? 453.6
      : 113.4;
  /* eslint-enable indent */

  return weight;
};

/**
 * Calculates the cost for a Shopify variant based on various factors.
 *
 * @param {boolean} is_shirt - Indicates whether the product is a shirt.
 * @param {boolean} has_sleeve - Indicates whether the product has a sleeve.
 * @param {boolean} has_back - Indicates whether the product has a back design.
 * @returns {number} The calculated cost for the variant.
 */
export const calculateShopifyVariantCost = (
  is_shirt: boolean,
  has_sleeve: boolean,
  has_front: boolean,
  has_back: boolean,
  size: string,
) => {
  /* eslint-disable indent */
  let cost =
    is_shirt && size == "2XL"
      ? 13.0
      : is_shirt && size == "3XL"
      ? 15.0
      : is_shirt && size == "4XL"
      ? 17.0
      : is_shirt && size == "5XL"
      ? 19.0
      : !is_shirt && size == "2XL"
      ? 22.0
      : !is_shirt && size == "3XL"
      ? 24.0
      : !is_shirt && size == "4XL"
      ? 26.0
      : !is_shirt && size == "5XL"
      ? 28.0
      : !is_shirt
      ? 20.0
      : 11.0;
  /* eslint-enable indent */

  if (has_front) {
    cost = Number(cost) + Number(1.25);
  }
  if (has_sleeve) {
    cost = Number(cost) + Number(1.25);
  }
  if (has_back) {
    cost = Number(cost) + Number(1.25);
  }

  return cost;
};
