import * as express from "express";
import * as functions from "firebase-functions";
import {
  redactCustomer,
  redactStore,
  requestCustomerData,
} from "../services/mandatory";

/**
 * Handles the Redact of a Shopify Merchant.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleStoreRedactGDPR = async (
  req: express.Request,
  res: express.Response,
) => {
  const data = req.body as Buffer;
  const hmacHeader = req.headers["x-shopify-hmac-sha256"];
  functions.logger.info(" 🗑️ [GDPR] - Delete Shopify Merchant Data.");

  const status = await redactStore(data, String(hmacHeader || ""));

  res.status(status).json(" 🎉 [CUSTOMER_REDACT]: Customer data erased.");
};

/**
 * Handles the Redact of a Merchant Customer.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleCustomerRedactGDPR = async (
  req: express.Request,
  res: express.Response,
) => {
  const data = req.body as Buffer;
  const hmacHeader = req.headers["x-shopify-hmac-sha256"];
  functions.logger.info(" 🗑️ [GDPR] - Delete Shopify Merchant Customer Data.");

  const status = await redactCustomer(data, String(hmacHeader || ""));

  res.status(status).json(" 🎉 [CUSTOMER_REDACT]: Customer data erased.");
};

/**
 * Handles the request of a Merchant Customer.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleCustomerRequestGDPR = async (
  req: express.Request,
  res: express.Response,
) => {
  const data = req.body as Buffer;
  const hmacHeader = req.headers["x-shopify-hmac-sha256"];
  functions.logger.info(" 📠 [GDPR] - Request Shopify Merchant Customer Data.");

  const {status} = await requestCustomerData(data, String(hmacHeader || ""));

  res.status(status).json(" 🎉 [CUSTOMER_REDACT]: : Customer data delivered.");
};
