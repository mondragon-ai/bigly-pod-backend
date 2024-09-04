import {generateRandomID} from "../../utils/generator";
import {ImagesProps, ProductDocument, Variant} from "../types/products";
import {ShopifyProductImages, ShopifyVariant} from "../types/shopify/products";

/**
 * Create a list of variants from the options || single variant in instance of no options.
 *
 * @param product - The product document.
 * @param options1 - The first set of options (e.g., sizes).
 * @param options2 - The second set of options (e.g., colors).
 * @param options3 - The third set of options (optional).
 * @returns {Variant[]} - The generated list of variants.
 */
export const createVariantsFromOptions = (
  product: ProductDocument,
  options1?: (
    | "Small"
    | "Medium"
    | "Large"
    | "XL"
    | "2XL"
    | "3XL"
    | "4XL"
    | "5XL"
  )[],
  options2?: ("WHITE" | "BLACK" | "GREEN" | "BLUE" | "GRAY")[],
  options3?: string[],
): Variant[] => {
  const SKU =
    product.base_sku && product.base_sku !== ""
      ? product.base_sku
      : product.title.toLowerCase().replace(" ", "-");

  const variants: Variant[] = [];

  if (options1 && options1.length > 0) {
    options1.forEach((one) => {
      if (options2 && options2.length > 0) {
        options2.forEach((two) => {
          if (options3 && options3.length > 0) {
            options3.forEach((three) => {
              variants.push(createVariant(SKU, product, one, two, three));
            });
          } else {
            variants.push(createVariant(SKU, product, one, two));
          }
        });
      } else {
        variants.push(createVariant(SKU, product, one, ""));
      }
    });
  }

  return variants;
};

/**
 * Creates a single variant object.
 *
 * @param {string} SKU - The base SKU.
 * @param {ProductDocument} product - The product document.
 * @param {"Small" | "Medium" | "Large" | "XL" | "2XL" | "3XL" | "4XL" | "5XL"} option1 - The first option (e.g., size).
 * @param {string} option2 - The second option (e.g., color).
 * @param {string} option3 - The third option (optional).
 * @returns {Variant} - The created variant object.
 */
const createVariant = (
  SKU: string,
  product: ProductDocument,
  option1: string,
  option2: string,
  option3?: string,
): Variant => {
  const skuSuffix = [option1, option2]
    .filter(Boolean)
    .map((opt) => (opt as string).charAt(0).toUpperCase())
    .join("-");

  return {
    variant_id: generateRandomID("var_"),
    product_id: product.id,
    sku: skuSuffix ? `${SKU}--${skuSuffix}` : SKU,
    price: product.cost,
    option1: option1,
    option2: option2 || "",
    option3: option3 || "",
    title: product.title,
    weight: product.weight,
    fulfillment_service: "",
    weight_unit: "g",
    requires_shipping: false,
    inventory_policy: "continue",
    cost: product.cost,
  };
};

/**
 * Converts a Shopify variant object into a generic variant object.
 * This function maps Shopify-specific fields to a more generic structure, converting types and ensuring consistency in the variant representation.
 *
 * @param {ShopifyVariant} shopifyVariant - The Shopify variant object to convert.
 * @returns {Variant} A generic variant object with standardized fields suitable for broader application use.
 *
 */
export function convertShopifyVariantToVariant(
  shopifyVariant: ShopifyVariant,
): Variant {
  return {
    product_id: shopifyVariant.product_id.toString(),
    variant_id: shopifyVariant.id.toString(),
    sku: shopifyVariant.sku,
    price: parseFloat(shopifyVariant.price.toString()),
    option1: shopifyVariant.option1,
    option2: shopifyVariant.option2,
    option3: shopifyVariant.option3 || "",
    title: shopifyVariant.title,
    weight_unit: shopifyVariant.weight_unit as "g",
    requires_shipping: shopifyVariant.requires_shipping,
    fulfillment_service: shopifyVariant.fulfillment_service,
    inventory_policy: shopifyVariant.inventory_policy as "continue",
    cost: Math.round(parseFloat(shopifyVariant.price.toString()) / 2.5) || 0,
    weight: shopifyVariant.weight,
  };
}

/**
 * Converts Shopify product image data to a generic image properties format.
 *
 * @param {ShopifyProductImages} shopifyImage - The Shopify image object to convert.
 * @returns {ImagesProps} A generic image properties object with standardized fields.
 */
export const convertShopifyImagestoImages = (
  shopifyImage: ShopifyProductImages,
): ImagesProps => {
  return {
    id: shopifyImage.id,
    src: shopifyImage.src,
    alt: shopifyImage.alt,
    width: shopifyImage.width || 0,
    height: shopifyImage.height || 0,
  };
};
