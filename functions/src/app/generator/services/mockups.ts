import * as functions from "firebase-functions";
import {MockupRequestBody} from "../../../lib/types/generator";
import {createSubcollectionDocument} from "../../../database/firestore";
import {createDesignPayload} from "../../../lib/payloads/mockups";
import {generateMockups} from "../../../lib/helpers/mockups";
import {MockupUrls} from "../../../lib/types/mockups";

/**
 * Logs and handles errors in a consistent way.
 *
 * @param {Error} error - The error object.
 * @param {string} message - Custom error message to log.
 */
export const handleError = (error: Error, message: string): void => {
  functions.logger.error(message, error);
  throw new Error(message);
};

type ProcessDesignReturnType = {
  status: number;
  ok: boolean;
  text: string;
  mockups: {
    urls: {front: MockupUrls[]; back: MockupUrls[]};
    design_id: string;
  } | null;
  error: boolean;
};

/**
 * Processes a design request, validates the input, generates mockup images, creates design data, and stores it in a database.
 *
 * @async
 * @param {MockupRequestBody} design - The design request body containing design information.
 * @param {string} domain - Domain for the shopify merchant
 * @param {string} shpat - Shopify merchant access token
 * @returns {Promise<{ProcessDesignReturnType}>} An object containing the status code, success status, response text, and result data (front and back mockup URLs, design UID).
 */
export async function processDesign(
  design: MockupRequestBody,
  domain: string,
  shpat: string,
): Promise<ProcessDesignReturnType> {
  try {
    // Validate input
    const validationError = validateDesignInput(design, domain, shpat);
    if (validationError) {
      return validationError;
    }

    // Generate mockup images
    const handleMockupGenorator = async (
      side: "FRONT" | "BACK",
    ): Promise<{url: string; alt: string}[]> => {
      const mockups = await Promise.all(
        design.colors.map(async (color) => {
          console.log({START: side, COLOR: color});
          return await generateMockups(
            design,
            color.toLowerCase(),
            side,
            domain,
          );
        }),
      );

      // Filter out any null results if generateMockups can return null
      return mockups.filter(
        (mockup): mockup is {url: string; alt: string} => mockup !== null,
      );
    };

    let front: MockupUrls[] = [];
    let back: MockupUrls[] = [];
    for (const side of design.sides) {
      if (side === "FRONT") {
        front = await handleMockupGenorator(side);
      } else {
        back = await handleMockupGenorator(side);
      }
    }

    if (
      (design.sides.includes("FRONT") && front.length == 0) ||
      (design.sides.includes("BACK") && back.length == 0)
    ) {
      return {
        status: 400,
        ok: false,
        text: "",
        mockups: null,
        error: true,
      };
    }

    // Create design data payload
    const payload = await createDesignPayload(
      design,
      domain,
      shpat,
      front,
      back,
    );

    // Store the design data in the database
    const {status} = await createSubcollectionDocument(
      "shopify_pod",
      String(payload.domain),
      "mockups",
      payload.id,
      payload,
    );

    // Prepare response
    return {
      status,
      ok: status < 300,
      text:
        status < 300
          ? "🎉 [SUCCESS]: Design successfully uploaded"
          : " 🚨 [ERROR]: Problems fetching images & saving design",
      mockups:
        status < 300 ? {urls: {front, back}, design_id: payload.id} : null,
      error: true,
    };
  } catch (error) {
    // Log and handle unexpected errors
    functions.logger.error("Error processing design:", error);
    return {
      status: 500,
      ok: false,
      text: "🚨 [ERROR]: An unexpected error occurred while processing the design.",
      mockups: null,
      error: true,
    };
  }
}

/**
 * Validates the design input.
 *
 * @param {MockupRequestBody} design - The design request body.
 * @param {string} domain - Domain for the shopify merchant
 * @param {string} shpat - Shopify merchant access token
 * @returns {{ status: number, ok: boolean, text: string, result: null } | null} An error response object if validation fails, otherwise null.
 */
function validateDesignInput(
  design: MockupRequestBody,
  domain: string,
  shpat: string,
): ProcessDesignReturnType | null {
  if (!design.base_sku || !design.design_urls) {
    return {
      status: 422,
      ok: false,
      text: "🚨 [ERROR]: Please add a base SKU & Title",
      mockups: null,
      error: true,
    };
  }
  if (!domain || !shpat) {
    return {
      status: 400,
      ok: false,
      text: "🚨 [ERROR]: Domain & SHPAT required",
      mockups: null,
      error: true,
    };
  }
  return null;
}
