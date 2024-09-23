import {fetchSubcollectionDocument} from "../../database/firestore";
import {convertColorForSKu} from "../../utils/formatter";
import {ShopifyLineItem} from "../types/shopify/orders";
import {PODLineItemsProps} from "../types/orders";
import {ProductDocument} from "../types/products";

/**
 * Finds and maps the variant IDs and quantities for a list of line items in a Shopify order.
 *
 * @param {string} domain - The domain of the Shopify store.
 * @param {ShopifyLineItem[]} lineItems - An array of Shopify line items from an order.
 * @returns {Promise<{ variant_id: string, quantity: number }[]>} A promise that resolves with an array of objects
 * @throws {Error} If there is an error during the variant lookup process.
 */
export const findVariantsInDB = async (
  domain: string,
  lineItems: ShopifyLineItem[],
): Promise<PODLineItemsProps[]> => {
  const variantIds: PODLineItemsProps[] = [];

  /* eslint-disable indent */
  const map_line_items = lineItems.map(async (li) => {
    const {product_id, variant_id, quantity, grams, price} = li;

    // Check if the product document exists in Firestore
    const {data} = await fetchSubcollectionDocument(
      "shopify_pod",
      domain,
      "products",
      String(product_id),
    );

    if (data) {
      const productData = data as ProductDocument;

      const images =
        productData.mockup_urls.front.length > 0
          ? productData.mockup_urls.front
          : productData.mockup_urls.back.length > 0
          ? productData.mockup_urls.back
          : [];

      // Check if the variant_id exists in the merged_variants array
      for (const vars of productData.merged_variants) {
        if (String(vars.merchant_variants_id) === String(variant_id)) {
          const SKU = vars.SKU.toLocaleLowerCase();
          const url = images.filter(
            (i) => !SKU.includes(convertColorForSKu(i.alt.toLocaleLowerCase())),
          )[0]
            ? images.filter(
                (i) =>
                  !SKU.includes(convertColorForSKu(i.alt.toLocaleLowerCase())),
              )[0].url
            : "";
          variantIds.push({
            variant_id: vars.pod_variants_id,
            merchant_variants_id: vars.merchant_variants_id,
            quantity: quantity,
            weight: grams,
            type: productData.type,
            cost: vars.cost,
            price: Number(price) || Number(Number(vars.cost) * 2.5),
            image:
              url && url !== ""
                ? url
                : images[0] && images[0].url
                ? images[0].url
                : "",
          });
        }
      }
    }
  });
  /* eslint-enable indent */

  await Promise.all(map_line_items);

  return variantIds;
};
