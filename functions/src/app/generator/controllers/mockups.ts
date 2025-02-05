import * as express from "express";
import * as functions from "firebase-functions";
import {processDesign} from "../services/mockups";
import {MockupRequestBody} from "../../../lib/types/generator";

/**
 * Handle Mockups generator
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleMockupGenerator = async (
  req: express.Request,
  res: express.Response,
) => {
  const design = req.body as MockupRequestBody;
  const {domain, shpat} = req.params;
  functions.logger.info(" 🎨 [GENRATE] - Handle Mockup ");

  const {status, text, mockups, error} = await processDesign(
    design,
    domain,
    shpat,
  );

  res.status(status).json({text, mockups, error});
};
