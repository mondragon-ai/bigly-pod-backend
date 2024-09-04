import {
  deleteRootDocument,
  fetchRootDocument,
} from "../../../database/firestore";
import {ServicesReponseType} from "../../../lib/types/shared";

/**
 * Fetches a merchant for a given domain. If the domain is provided, it fetches the specific merchant data.
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @returns {Promise<ServicesReponseType>} An object containing the status, data, error flag, and status text related to the fetch operation.
 */
export const fetchMerchant = async (
  domain: string,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: null,
    error: false,
    text: "Merchant fetched successfully",
  };

  if (!domain || domain === "") {
    res.error = true;
    res.status = 404;
    res.text = "Merchant domain not present";
    return res;
  }

  const {data, text, status} = await fetchRootDocument("shopify_pod", domain);
  res.status = status;
  res.text = status < 300 ? res.text : text;
  res.data = data ? data : null;

  return res;
};

/**
 * Deletes a merchant for a given domain.
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @returns {Promise<ServicesReponseType>} An object containing the status, error flag, and status text related to the delete operation.
 */
export const deleteMerchant = async (
  domain: string,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: 1,
    error: false,
    text: "Merchant deleted successfully",
  };

  if (!domain) {
    return {
      status: 400,
      error: true,
      text: "Merchant domain is required.",
      data: 0,
    };
  }

  try {
    const {status, text} = await deleteRootDocument("shopify_pod", domain);
    res.status = status;
    res.text = status < 300 ? res.text : text;
  } catch (error) {
    res.status = 500;
    res.error = true;
    res.text = "Failed to delete merchant.";
    res.data = 0;
  }

  return res;
};
