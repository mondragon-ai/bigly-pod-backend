import {
  fetchSubcollectionDocument,
  updateSubcollectionDocument,
} from "./firestore";
import {MockupDocument} from "../lib/types/mockups";

/**
 * Updates the design document with the created product ID.
 *
 * @async
 * @param {MockupDocument} design - The design document.
 * @param {string} productId - The Shopify product ID.
 * @returns {Promise<void>}
 */
export const updateDesignWithProductID = async (
  mockup: MockupDocument,
  productId: string,
): Promise<void> => {
  mockup.product_id = productId;
  await updateSubcollectionDocument(
    "shopify_pod",
    String(mockup.domain),
    "mockups",
    String(mockup.id),
    mockup,
  );
};

/**
 * Fetches the Mockup based on the design ID, domain, and access token.
 *
 * @async
 * @param {string} mockup_id - The ID of the mockups.
 * @param {string} domain - The domain of the Shopify store.
 * @returns {Promise<MockupDocument | null>} - The fetched design document, or null if not found.
 */
export async function fetchMockup(
  mockup_id: string,
  domain: string,
): Promise<MockupDocument | null> {
  console.log({mockup_id, domain});
  const {data} = await fetchSubcollectionDocument(
    "shopify_pod",
    domain,
    "mockups",
    mockup_id,
  );
  return data;
}
