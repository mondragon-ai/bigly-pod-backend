import * as express from "express";
import * as functions from "firebase-functions";
import {processProduct} from "../services/products";

/**
 * Handle Create Product Route
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleProductCreate = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, shpat} = req.params;
  const design_id = req.body.design_id;
  functions.logger.info(" 🛒 [PRODUCT] - " + design_id);

  const {status, text, result, error} = await processProduct(
    design_id,
    domain,
    shpat,
  );

  res.status(status).json({text, product: result, error});
};
