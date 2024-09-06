import * as admin from "firebase-admin";
import {MockupDocument, MockupUrls} from "../types/mockups";
import {encryptMsg} from "../../utils/encryption";
import {MockupBrands, MockupRequestBody} from "../types/generator";
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
  front: MockupUrls[],
  back: MockupUrls[],
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
      design_urls,
      type,
      cost,
      sleeve_side,
      is_shirt,
      front_is_main,
    } = design;

    return {
      domain,
      access_token: encryptedShpat,
      base_sku,
      title,
      colors,
      sizes,
      mockup_urls: {front, back},
      created_at: currentTime,
      updated_at: currentTime,
      status: "ACTIVE",
      id: desUid,
      shop_name: domain.split(".")[0],
      design_urls,
      type,
      cost,
      state: new Date().getTime(),
      dimension: dimension,
      position: position,
      product_id: "",
      is_shirt,
      front_is_main,
      brand: type.split("_").slice(1).join("_") as MockupBrands,
      sleeve_side: sleeve_side,
    };
  } catch (error) {
    console.error("Error in createDesignPayload:", error);
    throw new Error("Failed to create design payload due to encryption error.");
  }
};
