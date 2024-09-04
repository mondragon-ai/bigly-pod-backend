import {
  deleteSubcollectionDocument,
  fetchPaginatedSubcollection,
  fetchSubcollectionCollection,
  fetchSubcollectionDocument,
} from "../../../database/firestore";
import {ServicesReponseType} from "../../../lib/types/shared";

/**
 * Fetches mockups for a given domain and optional mockup ID. If the mockup ID is provided, it fetches a specific mockup;
 * otherwise, it fetches all mockups for that domain.
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @param {string | null} mockup_id - Optional specific mockup ID to fetch.
 * @returns {Promise<ServicesReponseType>} An object containing the status, data array, error flag, and status text related to the fetch operation.
 */
export const fetchMockups = async (
  domain: string,
  mockup_id: string | null,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: [],
    error: false,
    text: "Mockups fetched successfully",
  };

  if (!domain || domain === "") {
    res.error = true;
    res.status = 404;
    res.text = "Merchant not present";
  }

  /* eslint-disable indent */
  const fetchFunc = mockup_id
    ? () =>
        fetchSubcollectionDocument("shopify_pod", domain, "mockups", mockup_id)
    : () => fetchSubcollectionCollection("shopify_pod", domain, "mockups");
  /* eslint-enable indent */

  const {data, text, status} = await fetchFunc();
  res.status = status;
  res.text = status < 300 ? res.text : text;
  res.data = data ? (mockup_id ? [data] : data) : [];

  return res;
};

/**
 * Deletes mockups for a given domain and optional mockup ID or list of mockups.
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @param {string | null} mockup_id - Optional specific mockup ID to delete.
 * @param {string[] | null} mockups - Optional list of mockup IDs to delete.
 * @returns {Promise<ServicesReponseType>} An object containing the status, data array, error flag, and status text related to the delete operation.
 */
export const deleteMockups = async (
  domain: string,
  mockup_id: string | null,
  mockups: string[] | null,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: 1,
    error: false,
    text: "Mockups deleted successfully",
  };

  if (!domain) {
    return {
      status: 400,
      error: true,
      text: "Merchant domain is required.",
      data: 0,
    };
  }

  let mockups_deleted = mockup_id ? 1 : 0;

  try {
    if (mockups && mockups.length > 0) {
      const mockupsToDelete = mockups.map(async (mockupId) => {
        const {status, text} = await deleteSubcollectionDocument(
          "shopify_pod",
          domain,
          "mockups",
          mockupId,
        );
        res.status = status;
        res.text = status < 300 ? res.text : text;
        mockups_deleted += 1;
      });
      await Promise.all(mockupsToDelete);
    } else if (mockup_id) {
      const {status, text} = await deleteSubcollectionDocument(
        "shopify_pod",
        domain,
        "mockups",
        mockup_id,
      );
      res.status = status;
      res.text = status < 300 ? res.text : text;
      mockups_deleted = 1;
    }
  } catch (error) {
    res.status = 500;
    res.error = true;
    res.text = "Failed to delete mockups.";
    res.data = 0;
  }
  res.data = mockups_deleted;

  return res;
};

/**
 * Fetches the next paginated list of mockups for a given domain.
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @param {string | null} last_item_seconds - Last mockup (seconds).
 * @returns {Promise<ServicesReponseType>} An object containing the status, data array, error flag, and status text related to the fetch operation.
 */
export const fetchNextMockupList = async (
  domain: string,
  last_item_seconds: string | null,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: [],
    error: false,
    text: "Next list of mockups fetched successfully",
  };

  if (!last_item_seconds || !domain) {
    return {
      status: 400,
      error: true,
      text: "Merchant domain or last item is required.",
      data: null,
    };
  }

  const {status, text, data} = await fetchPaginatedSubcollection(
    "shopify_pod",
    domain,
    "mockups",
    last_item_seconds,
    "next",
  );

  res.status = status;
  res.text = status < 300 ? res.text : text;
  res.data = data ? data : [];

  return res;
};

/**
 * Fetches the previous paginated list of mockups for a given domain.
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @param {string | null} first_item_seconds - First mockup (seconds).
 * @returns {Promise<ServicesReponseType>} An object containing the status, data array, error flag, and status text related to the fetch operation.
 */
export const fetchPreviousMockupList = async (
  domain: string,
  first_item_seconds: string | null,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: [],
    error: false,
    text: "Previous list of mockups fetched successfully",
  };

  if (!first_item_seconds || !domain) {
    return {
      status: 400,
      error: true,
      text: "Merchant domain or first item is required.",
      data: null,
    };
  }

  const {status, text, data} = await fetchPaginatedSubcollection(
    "shopify_pod",
    domain,
    "mockups",
    first_item_seconds,
    "prev",
  );

  res.status = status;
  res.text = status < 300 ? res.text : text;
  res.data = data ? data : [];

  return res;
};
