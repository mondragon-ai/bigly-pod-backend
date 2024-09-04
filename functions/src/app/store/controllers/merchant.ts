import * as express from "express";
import * as functions from "firebase-functions";
import {deleteMerchant, fetchMerchant} from "../services/merchant";
/**
 * Fetch the merchant for the store
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to return the merchant data.
 */
export const handleFetchingMerchant = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  functions.logger.info(" 🏪 [/FETCH]: " + domain);

  // Get Merchant
  const {data, status, text} = await fetchMerchant(domain);

  return res.status(status).json({
    text: text,
    merchant: data,
  });
};

/**
 * Delete a merchant collection
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleDeleteMerchant = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  functions.logger.info(" 🏪 [/DELETE]: " + domain);

  const {status, text, error} = await deleteMerchant(domain);

  return res.status(status < 300 ? 204 : status).json({text, error});
};
