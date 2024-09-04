import * as admin from "firebase-admin";
import {MockupDocument} from "../types/mockups";
import {encryptMsg} from "../../utils/encryption";
import {MockupRequestBody} from "../types/generator";
import {generateRandomID} from "../../utils/generator";

/**
 * Creates and structures design data based on the provided parameters.
 *
 * @async
 * @param {MockupRequestBody} design - The design request body containing design information.
 * @param {string} domain - The domain associated with the design.
 * @param {string} shpat - The Shopify access token.
 * @param {{ url: string, alt: string }[]} mockup_urls - An array of mockup URLs with alt text.
 * @returns {Promise<MockupDocument>} A promise that resolves to the payload object for saving the design in the database.
 * @throws {Error} Throws an error if the encryption fails.
 */
export const createDesignPayload = async (
  design: MockupRequestBody,
  domain: string,
  shpat: string,
  mockup_urls: {url: string; alt: string}[],
): Promise<MockupDocument> => {
  try {
    const encryptedShpat = await encryptMsg(shpat);

    // Generate a unique ID for the design
    const desUid = generateRandomID("des_");

    const currentTime =
      admin.firestore && admin.firestore.Timestamp
        ? admin.firestore.Timestamp.now()
        : new Date();

    const {
      base_sku = "",
      title = "",
      colors = [],
      sizes,
      dimension,
      position,
      design_url,
      type,
      cost,
    } = design;

    return {
      domain,
      access_token: encryptedShpat,
      base_sku,
      title,
      colors,
      sizes,
      mockup_urls,
      created_at: currentTime,
      updated_at: currentTime,
      status: "ACTIVE",
      id: desUid,
      shop_name: domain.split(".")[0],
      design_url: design_url || "",
      type: type,
      cost,
      state: new Date().getTime(),
      dimension: {
        original_width: dimension.original_width || 0,
        original_height: dimension.original_height || 0,
        resized_height: dimension.resized_height || 0,
        resized_width: dimension.resized_width || 0,
        blank_width: dimension.blank_width || 0,
        blank_height: dimension.blank_height || 0,
      },
      position: {
        top: position.top || 0,
        left: position.left || 0,
      },
      product_id: "",
    };
  } catch (error) {
    console.error("Error in createDesignPayload:", error);
    throw new Error("Failed to create design payload due to encryption error.");
  }
};
