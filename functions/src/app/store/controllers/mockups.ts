import * as express from "express";
import * as functions from "firebase-functions";
import {
  deleteMockups,
  fetchMockups,
  fetchNextMockupList,
  fetchPreviousMockupList,
} from "../services/mockups";

/**
 * Fetch the mockup(s) for the store
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleFetchingMockups = async (
  req: express.Request,
  res: express.Response,
) => {
  const mockup_id = req.query.id;
  const {domain} = req.params;

  functions.logger.info(
    " 🎨 [/FETCH]: " + (mockup_id ? `${mockup_id}` : "all") + ` for ${domain}`,
  );

  const id = mockup_id && typeof mockup_id == "string" ? mockup_id : null;

  // Get Mockups
  const {data, status, text} = await fetchMockups(domain, id);

  return res.status(status).json({
    text: text,
    mockups: data,
  });
};

/**
 * Delete a mockup for the store
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleDeleteMockup = async (
  req: express.Request,
  res: express.Response,
) => {
  const {id, mockups} = req.query;
  const {domain} = req.params;

  const mockup_id = id && typeof id === "string" ? id : null;
  const mockup_list = mockups ? (mockups as string).split(",") : null;

  functions.logger.info(
    " 🎨 [/DELETE]: " + (mockup_list ? "mockup list" : id) + ` for ${domain}`,
  );

  const {status, text, error} = await deleteMockups(
    domain,
    mockup_id,
    mockup_list as string[],
  );

  return res.status(status < 300 ? 204 : status).json({text, error});
};

/**
 * Fetch next list of mockups for the store-- if available
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleNextMockups = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, last_item_seconds} = req.params;

  const last_mockup = last_item_seconds ? last_item_seconds : null;

  functions.logger.info(" 🎨 [/NEXT]: " + `${last_mockup} for ${domain}`);

  const {status, text, error, data} = await fetchNextMockupList(
    domain,
    last_mockup,
  );

  return res.status(status).json({text, error, data});
};

/**
 * Fetch previous list of mockups for the store-- if available
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handlePreviousMockups = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, first_item_seconds} = req.params;

  const first_mockup = first_item_seconds ? first_item_seconds : null;

  functions.logger.info(" 🎨 [/PREVIOUS]: " + `${first_mockup} for ${domain}`);

  const {status, text, error, data} = await fetchPreviousMockupList(
    domain,
    first_mockup,
  );

  return res.status(status).json({text, error, data});
};
