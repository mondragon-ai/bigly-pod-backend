import * as functions from "firebase-functions";
import {MockupDocument} from "../lib/types/mockups";
import {createErrorResponse} from "../utils/errors";
import {ProductDocument} from "../lib/types/products";
import {updateSubcollectionDocument} from "../database/firestore";
import {addImagesToVariants} from "../lib/helpers/shopify/products";

/**
 * Firestore onCreate trigger for Products.
 *
 * @param {functions.firestore.DocumentSnapshot} snap - The Firestore snapshot of the created document.
 * @param {functions.EventContext} context - The event context.
 * @returns {Promise<null>} A promise that resolves to `null`.
 */
export const productCreated = functions.firestore
  .document("/shopify_pod/{merchant}/products/{productID}")
  .onCreate(async (snap) => {
    try {
      const product: ProductDocument = snap.data() as ProductDocument;
      const {access_token, domain} = product;
      const shop = domain.split(".")[0];

      // Update the Mockup Document
      await updateSubcollectionDocument(
        "shopify_pod",
        domain,
        "mockups",
        product.mockup_id,
        {product_id: product.id} as MockupDocument,
      );

      // Add Images to variants
      await addImagesToVariants(product, access_token, shop);

      // ? Add Product to Merchant list of IDs
      // await updateRootDocument("shopify_pod", domain, {products_created: } as ShopifyMerchant)

      return null;
    } catch (error) {
      createErrorResponse(500, "Error in ProductCreated Trigger function");
      return null;
    }
  });
