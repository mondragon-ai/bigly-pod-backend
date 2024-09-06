import {MockupRequestBody, MockupTypes} from "../types/generator";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sharp from "sharp";
import {apparel_blanks, hoodie_strings} from "../data/apparel";
import {COMPOSITE_DIMENSIONS, RESIZE_DIMENSIONS} from "../constants";

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
  side: "FRONT" | "BACK",
  domain: string,
): Promise<{url: string; alt: string} | null> => {
  try {
    const blankImage = await fetchBlankImage(design.type, color, side);
    if (!blankImage) {
      functions.logger.error("404 - Blank image not found");
      return null;
    }

    const resizedDesign = await fetchAndResizeDesign(design, side);
    if (!resizedDesign) {
      functions.logger.error("400 - Failed to fetch or resize design image");
      return null;
    }

    if (
      design.type.includes("shirt") &&
      side == "FRONT" &&
      design.design_urls.sleeve !== ""
    ) {
      const sleeveDesign = await fetchAndResizeSleeveDesign(design);
      if (sleeveDesign) resizedDesign.push(sleeveDesign);
    }

    let compositeImageBuffer = await compositeImages(
      blankImage,
      resizedDesign,
      design.type,
    );
    if (!compositeImageBuffer) {
      functions.logger.error("500 - Failed to composite images");
      return null;
    }

    if (design.type.includes("hoodie") && side == "FRONT") {
      compositeImageBuffer = await fetchAndResizeHoodieString(
        design,
        color,
        compositeImageBuffer,
      );
    }
    if (!compositeImageBuffer) {
      functions.logger.error(
        "500 - Failed to composite [hoodies string] images",
      );
      return null;
    }

    const mockupUrls = await uploadMockupsToGCP(
      compositeImageBuffer,
      domain,
      color,
    );
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
 * @param {MockupTypes} type - The type of apparel.
 * @param {string} color - The color of hat mockups.
 * @returns {Promise<Buffer | null>} A promise that resolves to the Buffer of the blank image or null if not found.
 */
async function fetchBlankImage(
  type: MockupTypes,
  color: string,
  side: "FRONT" | "BACK",
): Promise<Buffer | null> {
  // console.log({color, type});
  try {
    const mockup_url =
      apparel_blanks[type][side.toLocaleLowerCase()][color.toLocaleUpperCase()];
    console.log({mockup_url});
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
 * @param {MockupRequestBody} design - The design Object.
 * @param { "FRONT" | "BACK"} side - The design Object.
 * @returns {Promise<{ input: Buffer; top: number; left: number }[] | null>} A promise that resolves to an array
 */
async function fetchAndResizeDesign(
  design: MockupRequestBody,
  side: "FRONT" | "BACK",
): Promise<{input: Buffer; top: number; left: number}[] | null> {
  const {design_urls, dimension, type, position} = design;
  const s = side.toLocaleLowerCase() as "front" | "back";
  try {
    const designResponse = await fetch(design_urls[s]);
    if (!designResponse.ok) {
      throw new Error("Failed to fetch design image");
    }

    const designBuffer = Buffer.from(await designResponse.arrayBuffer());
    const resizedDesignBuffer = await sharp(designBuffer)
      .resize(
        Math.round(
          dimension[`resized_width_${s}`] * RESIZE_DIMENSIONS[type][side].width,
        ),
        Math.round(
          dimension[`resized_height_${s}`] *
            RESIZE_DIMENSIONS[type][side].height,
        ),
      )
      .toBuffer();

    return [
      {
        input: resizedDesignBuffer,
        top:
          Math.round(
            position[`top_${s}`] * RESIZE_DIMENSIONS[type][side].top_m,
          ) + RESIZE_DIMENSIONS[type][side].top,
        left:
          Math.round(
            position[`left_${s}`] * RESIZE_DIMENSIONS[type][side].left_m,
          ) + RESIZE_DIMENSIONS[type][side].left,
      },
    ];
  } catch (error) {
    console.error("Error in fetchAndResizeDesign:", error);
    return null;
  }
}

/**
 * Calculates the offset for sleeve positioning based on the sleeve side and resized dimensions.
 * @param sleeveSide 'LEFT' or 'RIGHT'
 * @param dimension The dimension object containing width and height.
 * @param type The type of the mockup.
 * @returns Calculated offset for the left position.
 */
function calculateOffset(
  sleeveSide: string,
  dimension: {resized_width_sleeve: number},
  type: MockupTypes,
): number {
  const baseOffset = sleeveSide === "LEFT" ? 75 : 1515;
  return (
    baseOffset +
    Math.round(
      ((80 - dimension.resized_width_sleeve) / 2) *
        RESIZE_DIMENSIONS[type].FRONT.width,
    )
  );
}

/**
 * Fetches and resizes a sleeve design based on specified dimensions and type.
 *
 * @param {MockupRequestBody} design - The design specifications including URLs, dimensions, type, and sleeve side.
 * @returns {Promise<{input: Buffer, top: number, left: number} | null>} A promise that resolves with the resized and repositioned sleeve design
 * or null in case of an error.
 *
 */
export const fetchAndResizeSleeveDesign = async (design: MockupRequestBody) => {
  const {design_urls, sleeve_side, dimension, type} = design;

  try {
    const response = await fetch(design_urls.sleeve);
    if (!response.ok) {
      console.error(
        "Failed to fetch sleeve design image:",
        response.statusText,
      );
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    const designImage = sharp(Buffer.from(imageBuffer));

    const rotationAngle = sleeve_side === "LEFT" ? 27 : -28;
    const sleeveResizedDesignBuffer = await designImage
      .resize(
        Math.round(
          dimension.resized_width_sleeve * RESIZE_DIMENSIONS[type].FRONT.width,
        ),
        Math.round(
          dimension.resized_height_sleeve *
            RESIZE_DIMENSIONS[type].FRONT.height,
        ),
      )
      .rotate(rotationAngle, {background: {r: 0, g: 0, b: 0, alpha: 0}})
      .toBuffer();

    const topOffset =
      545 +
      Math.round(
        ((50 - dimension.resized_height_sleeve) / 2) *
          RESIZE_DIMENSIONS[type].FRONT.width,
      );

    return {
      input: sleeveResizedDesignBuffer,
      top: topOffset,
      left: calculateOffset(sleeve_side, dimension, type),
    };
  } catch (error) {
    console.error("Error in fetchAndResizeSleeveDesign:", error);
    return null;
  }
};

/**
 * Fetches, resizes, and composites a hoodie string image onto a given mockup.
 *
 * @param {MockupRequestBody} design - The design specifications including the type of the hoodie.
 * @param {string} color - The color of the hoodie string to fetch.
 * @param {Buffer} composite_buffer - The image buffer onto which the hoodie string image will be composited.
 * @returns {Promise<Buffer>} A promise that resolves with the new image buffer after compositing the resized hoodie string.
 *
 */
export const fetchAndResizeHoodieString = async (
  design: MockupRequestBody,
  color: string,
  composite_buffer: Buffer,
) => {
  const hoodie_string = hoodie_strings[design.type][color.toLocaleUpperCase()];
  const hoodie_string_response = await fetch(hoodie_string);
  if (!hoodie_string_response.ok) {
    throw new Error("Failed to fetch hoodie string image");
  }

  const hoodieStringBuffer = Buffer.from(
    await hoodie_string_response.arrayBuffer(),
  );
  const hoodieStringBufferImage = await sharp(hoodieStringBuffer);

  // Resize the hoodie strings proportionally
  const stringResizedDesignBuffer = await hoodieStringBufferImage
    .resize(1950, 2560)
    .toBuffer();

  // Composite the strings onto the mockup
  return await sharp(composite_buffer)
    .composite([{input: stringResizedDesignBuffer}])
    .toBuffer();
};

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
  type: MockupTypes,
): Promise<Buffer | null> {
  try {
    const compositeBuffer = await sharp(blank_image_buffer)
      .resize(
        COMPOSITE_DIMENSIONS[type].width,
        COMPOSITE_DIMENSIONS[type].height,
      )
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
