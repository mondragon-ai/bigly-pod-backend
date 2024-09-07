import * as express from "express";
import {
  handleCancellingFulfillmentOrder,
  handleFulfillmentNotification,
} from "../controllers/fulfillment";

export const fulfillmentRoutes = (app: express.Router) => {
  app.all("/fulfillment_order_notification", handleFulfillmentNotification);
  app.all("/:domain/cancel", handleCancellingFulfillmentOrder);
};
