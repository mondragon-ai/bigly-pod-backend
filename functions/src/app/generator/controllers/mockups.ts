import * as express from "express";
import * as functions from "firebase-functions";
import {MockupRequestBody} from "../../../lib/types/generator";
// import {processDesign} from "../services/mockups";

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
  functions.logger.info(" 🎨 [MOCKUPS] - Handle Mockups");

  console.log({domain, shpat});
  console.log({design});

  // const {status, text, mockups, error} = await processDesign(
  //   design,
  //   domain,
  //   shpat,
  // );

  res.status(200).json({text: "", mockups: design, error: null});
};
