import * as express from "express";
import * as functions from "firebase-functions";
import {handlePODFulfillment} from "../services/fulfillment";

/**
 * Handles the Notification for fulfillment object of of a Shopify Merchant order.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleFulfillmentNotification = async (
  req: express.Request,
  res: express.Response,
) => {
  const {order_id, access_token, shop, location_id} = req.body;
  functions.logger.info(
    " 💳 [FULFIMMENT] - Order complete: /orders/fulfillment_order_notification",
  );
  console.log(req.body);

  await handlePODFulfillment(order_id, access_token, shop, location_id);

  res.status(200).json(" 🎉 [PUBSUB]: Order complete");
};

/**
 * Cancel POD Order && Accept Cancellation for Merchant && update Order Doc
 *
 * @param {express.Request} req - The request object containing the domain parameter.
 * @param {express.Response} res - The response object to confirm deletion.
 */
export const handleCancellingFulfillmentOrder = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  const payload = req.body.payload;
  functions.logger.info(" 🗑️ [/CANCELLING]: " + domain);

  functions.logger.info({payload});
  functions.logger.info({body: req.body});

  return res.status(200).json({text: "", error: null});
};
