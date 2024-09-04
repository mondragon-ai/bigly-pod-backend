import {MockupRequestBody, MockupTypes} from "../types/generator";
import {MockupDimensions, MockupPosition} from "../types/mockups";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sharp from "sharp";
import {apparel_blanks} from "../data/apparel";

/**
 * Generates mockups based on the provided design request body.
 *
 * @async
 * @param {MockupRequestBody} design - The design request body containing necessary design details.
 * @param {string} color - The color of hat mockups.
 * @param {string} domain - The domain of the merchant store.
 * @returns {Promise<GenerateMockupResponseType>} A promise that resolves to an object containing the mockup URLs, status code, and a message.
 */
export const generateMockups = async (
  design: MockupRequestBody,
  color: string,
  domain: string,
): Promise<{url: string; alt: string} | null> => {
  try {
    const blankImage = await fetchBlankImage(design.type, color);
    if (!blankImage) {
      functions.logger.error("404 - Blank image not found");
      return null;
    }

    const resizedDesign = await fetchAndResizeDesign(
      design.design_url,
      design.dimension,
      design.position,
      design.type,
    );
    if (!resizedDesign) {
      functions.logger.error("400 - Failed to fetch or resize design image");
      return null;
    }

    const compositeImage = await compositeImages(blankImage, resizedDesign);
    if (!compositeImage) {
      functions.logger.error("500 - Failed to composite images");
      return null;
    }

    const mockupUrls = await uploadMockupsToGCP(compositeImage, domain, color);
    if (!mockupUrls) {
      functions.logger.error("500 - Failed to upload mockups");
      return null;
    }

    return mockupUrls;
  } catch (error) {
    console.error("Error generating mockups:", error);
    return null;
  }
};

/**
 * Fetches the blank image for the given base type.
 *
 * @async
 * @param {MockupTypes} type - The type of hat.
 * @param {string} color - The color of hat mockups.
 * @returns {Promise<Buffer | null>} A promise that resolves to the Buffer of the blank image or null if not found.
 */
async function fetchBlankImage(
  type: MockupTypes,
  color: string,
): Promise<Buffer | null> {
  // console.log({color, type});
  try {
    const mockup_url = apparel_blanks[type][color.toLocaleUpperCase()];
    const response = await fetch(mockup_url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch blank image for type: ${type}, color: ${color}`,
      );
    }

    const mockupArrayBuffer = await response.arrayBuffer();
    return Buffer.from(mockupArrayBuffer);
  } catch (error) {
    console.error("Error in fetchBlankImage:" + color, error);
    return null;
  }
}

/**
 * Fetches and resizes the design image based on the provided dimensions.
 *
 * @async
 * @param {string} design_url - The URL of the design image.
 * @param {MockupDimensions} dimensions - The dimensions for resizing the design image.
 * @param {MockupPosition} position - The position for placing the resized design image.
 * @returns {Promise<{ input: Buffer; top: number; left: number }[] | null>} A promise that resolves to an array
 */
async function fetchAndResizeDesign(
  design_url: string,
  dimensions: MockupDimensions,
  position: MockupPosition,
  type: MockupTypes,
): Promise<{input: Buffer; top: number; left: number}[] | null> {
  try {
    const designResponse = await fetch(design_url);
    if (!designResponse.ok) {
      throw new Error("Failed to fetch design image");
    }

    const designBuffer = Buffer.from(await designResponse.arrayBuffer());
    const resizedDesignBuffer = await sharp(designBuffer)
      .resize(
        Math.round(dimensions.resized_width * 2.00668896324),
        Math.round(dimensions.resized_height * 2.00668896324),
      )
      .toBuffer();

    /* eslint-disable indent */
    const top =
      type == "hoodie_lane_7" ? 435 : type == "shirt_gilden" ? 300 : 325;
    /* eslint-enable indent */

    return [
      {
        input: resizedDesignBuffer,
        top: Math.round(position.top * 1.65) + top,
        left: Math.round(position.left * 1.9) + 220,
      },
    ];
  } catch (error) {
    console.error("Error in fetchAndResizeDesign:", error);
    return null;
  }
}

/**
 * Composites the blank image and the resized design image.
 *
 * @async
 * @param {Buffer} blank_image_buffer - The buffer of the blank image.
 * @param {{ input: Buffer; top: number; left: number }[]} compositing_array - An array containing the resized design image buffer and its position.
 * @returns {Promise<Buffer | null>} A promise that resolves to the buffer of the composite image or null if compositing fails.
 */
async function compositeImages(
  blank_image_buffer: Buffer,
  compositing_array: {input: Buffer; top: number; left: number}[],
): Promise<Buffer | null> {
  try {
    const compositeBuffer = await sharp(blank_image_buffer)
      .resize(1200, 1200)
      .composite(compositing_array)
      .toBuffer();

    return compositeBuffer;
  } catch (error) {
    console.error("Error in compositeImages:", error);
    return null;
  }
}

/**
 * Uploads the composite image to Google Cloud Platform (GCP) and returns the URLs.
 *
 * @async
 * @param {Buffer} mockup_image_buffer - The buffer of the composite mockup image.
 * @param {string} domain - The domain of the Shopify store.
 * @param {string} color - The color of the mockup.
 * @returns {Promise<{ url: string; alt: string }[] | null>} A promise that resolves to an array of mockup URLs or null if the upload fails.
 */
async function uploadMockupsToGCP(
  mockup_image_buffer: Buffer,
  domain: string,
  color: string,
): Promise<{url: string; alt: string} | null> {
  if (!mockup_image_buffer) {
    console.error("No image buffer provided for upload");
    return null;
  }

  const newFileName = `${Date.now()}.png`;
  const fileUpload = admin
    .storage()
    .bucket("only-caps.appspot.com")
    .file(`${domain}/mockup/${newFileName}`);

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: "image/png",
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", (error) => {
      console.error("Error uploading image to storage:", error);
      reject(new Error("Reason for rejection"));
    });

    blobStream.on("finish", async () => {
      try {
        await fileUpload.makePublic();
        const url = fileUpload.publicUrl();
        resolve({url, alt: color});
      } catch (error) {
        console.error("Error making file public:", error);
        reject(new Error("Reason for rejection"));
      }
    });

    blobStream.end(mockup_image_buffer);
  });
}
