import {
  ShopifyProductImages,
  ShopifyProductOptions,
  ShopifyProductPayload,
  ShopifyVariants,
} from "../../types/shopify/products";
import {MockupDocument} from "../../types/mockups";
import {generateRandomID} from "../../../utils/generator";
import {convertColorForSKu} from "../../../utils/formatter";
import {apparel_blanks} from "../../data/apparel";

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
  const variants: ShopifyVariants[] = [];
  const SKU = generateSKU(mockup);
  const cost = Number(apparel_blanks[mockup.type].cost);
  console.log({cost});

  if (mockup.colors && mockup.colors.length > 0) {
    mockup.sizes.forEach((size) => {
      mockup.colors.forEach((color) => {
        variants.push({
          option1: size || "",
          option2: convertColorForSKu(color) || "",
          option3: "",
          price: is_pod
            ? Number(Math.floor(cost).toFixed(2))
            : Number(Math.floor(cost * 2.5).toFixed(2)),
          sku: SKU + `-${convertColorForSKu(color)}`,
          weight: 85,
          weight_unit: "g",
          requires_shipping: true,
          inventory_policy: "continue",
          cost: cost,
          fulfillment_service: is_pod ? "manual" : "biglypod-solutions",
        } as ShopifyVariants);
      });
    });
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

  mockup.mockup_urls.forEach((img) => {
    pushImage(img.url, img.alt);
  });

  if (mockup.design_url !== "") {
    pushImage(mockup.design_url, "DESIGN");
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
