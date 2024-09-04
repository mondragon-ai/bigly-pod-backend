import {createProductWithShopify} from "../../../lib/helpers/shopify/products";
import {createProductPayload} from "../../../lib/payloads/products";
import {createProductInDB} from "../../../database/products";
import {MockupDocument} from "../../../lib/types/mockups";
import {createErrorResponse} from "../../../utils/errors";
import {fetchMockup} from "../../../database/mockups";
import {Status} from "../../../lib/types/shared";
import {
  createShopifyProductPayload,
  generateShopifyProductImageList,
  generateShopifyProductOptions,
  generateShopifyProductVariants,
} from "../../../lib/payloads/shopify/products";
import {
  ShopifyProductPayload,
  ShopifyProductResponse,
} from "../../../lib/types/shopify/products";

type ProcessProductReturnType = {
  status: Status;
  ok: boolean;
  text: string;
  result: any | null;
  error: boolean;
};
/**
 * Processes the product creation workflow, including fetching the design, creating the product payload, and processing variants.
 *
 * @async
 * @param {string} design_id - The ID of the design.
 * @param {string} domain - The domain of the Shopify store.
 * @param {string} shpat - The Shopify access token.
 * @returns {Promise<ProcessProductReturnType>} - The result of the product processing, including status, text, and product data if successful.
 */
export const processProduct = async (
  design_id: string,
  domain: string,
  shpat: string,
): Promise<ProcessProductReturnType> => {
  try {
    // 1. Fetch Mockup
    const mockup = await fetchMockup(design_id, domain);
    if (!mockup) {
      return createErrorResponse(404, "Mockups not found");
    }

    // 2. Build Shopify product payloads
    const shopifyProducts = buildShopifyProductPayload(mockup);

    // 3. Create products in Shopify (POD & Merchant)
    const shopifyCreationResult = await createShopifyProducts(
      shopifyProducts,
      domain,
      shpat,
    );

    if (shopifyCreationResult.error || !shopifyCreationResult.result) {
      return createErrorResponse(400, shopifyCreationResult.text);
    }

    const {pod_product, merchant_product} = shopifyCreationResult.result;

    // 4. Create products payload (Firestore)
    const productPayload = await createProductPayload(
      mockup,
      merchant_product,
      pod_product,
      shpat,
    );

    // 5. Save products payload to DB (Firestore)
    const saveStatus = await createProductInDB(productPayload, domain);
    if (saveStatus > 300) {
      return createErrorResponse(
        saveStatus,
        "[ERROR]: Saving the design document.",
      );
    }

    return {
      status: 201,
      ok: true,
      text: "Product created successfully",
      result: productPayload,
      error: false,
    };
  } catch (error) {
    return createErrorResponse(500, "Internal server error");
  }
};

/**
 * Builds the Shopify product payload object for both POD and Merchant shops.
 *
 * @param {MockupDocument} mockup - The mockup document.
 * @returns {object} - The Shopify product payload object for both POD and Merchant shops.
 */
export const buildShopifyProductPayload = (
  mockup: MockupDocument,
): {pod: ShopifyProductPayload; merchant: ShopifyProductPayload} => {
  const shopifyProductPayload = {} as {
    pod: ShopifyProductPayload;
    merchant: ShopifyProductPayload;
  };

  for (let i = 0; i < 2; i++) {
    const isPod = i === 0;
    const variants = generateShopifyProductVariants(mockup, isPod);
    const images = generateShopifyProductImageList(mockup);
    const options = generateShopifyProductOptions(mockup);

    if (isPod) {
      shopifyProductPayload.pod = createShopifyProductPayload(
        mockup,
        variants,
        images,
        options,
      );
    } else {
      shopifyProductPayload.merchant = createShopifyProductPayload(
        mockup,
        variants,
        images,
        options,
      );
    }
  }

  return shopifyProductPayload;
};

/**
 * Creates Shopify products for both POD and Merchant stores.
 *
 * @async
 * @param {object} shopifyProducts - The Shopify product payloads for both POD and Merchant stores.
 * @param {string} domain - The domain of the Shopify store.
 * @param {string} shpat - The Shopify access token.
 * @returns {Promise<object>} - The result of the Shopify product creation process.
 */
export const createShopifyProducts = async (
  shopifyProducts: {
    pod: ShopifyProductPayload;
    merchant: ShopifyProductPayload;
  },
  domain: string,
  shpat: string,
): Promise<{
  ok: boolean;
  status: Status;
  text: string;
  result: {
    pod_product: ShopifyProductResponse;
    merchant_product: ShopifyProductResponse;
  } | null;
  error: boolean;
}> => {
  try {
    const shop = domain.split(".")[0] || "";
    const merchantProduct = await createProductWithShopify(
      shopifyProducts.merchant,
      shpat,
      shop,
    );
    if (!merchantProduct?.product?.id) {
      return createErrorResponse(
        400,
        "[ERROR]: Could not create product for Merchant Shopify.",
      );
    }

    const podToken = process.env.SHOPIFY_BIGLY_POD || "";
    const podProduct = await createProductWithShopify(
      shopifyProducts.pod,
      podToken,
      "bigly-pod",
    );
    if (!podProduct?.product?.id) {
      return createErrorResponse(
        400,
        "[ERROR]: Could not create product for POD Shopify.",
      );
    }

    return {
      ok: true,
      status: 200,
      text: " 🎉 [SUCCESS] Products created",
      result: {pod_product: podProduct, merchant_product: merchantProduct},
      error: false,
    };
  } catch (error) {
    return createErrorResponse(500, "[ERROR]: Internal server error.");
  }
};

// // 5. Update mockup document to add merchant shopify ID to DB (firestore)
// await updateDesignWithProductID(mockup, String(result.id));
