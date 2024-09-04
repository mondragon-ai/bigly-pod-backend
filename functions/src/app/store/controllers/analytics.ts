import * as express from "express";
import * as functions from "firebase-functions";
import {fetchAnalytics} from "../services/analytics";
import {TimeFrameProps} from "../../../lib/types/analytics";

/**
 * Fetch the order(s) for the store
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleFetchingAnalytics = async (
  req: express.Request,
  res: express.Response,
) => {
  const {timezone, time_frame: time} = req.query;
  const {domain} = req.params;
  const time_frame = time && typeof time == "string" ? time : "seven_days";
  functions.logger.info(" 📉 [/FETCH]: " + time_frame + ` for ${domain}`);

  // Get Analytics
  const {data, status, text} = await fetchAnalytics(
    domain,
    time_frame as TimeFrameProps,
    String(timezone),
  );

  // console.log({data, status, text});

  return res.status(status).json({
    text: text,
    analytics: data,
  });
};
