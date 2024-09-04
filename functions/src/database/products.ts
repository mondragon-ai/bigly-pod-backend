import {Status} from "../lib/types/shared";
import {ProductDocument} from "../lib/types/products";
import {createSubcollectionDocument} from "./firestore";

/**
 * Saves the product to the database.
 *
 * @async
 * @param {ProductDocument} product_payload - The design document.
 * @param {string} domain - The Shopify product ID.
 * @returns {Promise<Status>} The status code of the database operation.
 */
export const createProductInDB = async (
  product_payload: ProductDocument,
  domain: string,
): Promise<Status> => {
  const {status} = await createSubcollectionDocument(
    "shopify_pod",
    String(domain),
    "products",
    String(product_payload.id),
    product_payload,
  );
  return status;
};
