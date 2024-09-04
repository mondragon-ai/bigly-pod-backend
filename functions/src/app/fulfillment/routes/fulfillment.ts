import * as express from "express";
import {handleFulfillmentNotification} from "../controllers/fulfillment";

export const fulfillmentRoutes = (app: express.Router) => {
  app.all("/fulfillment_order_notification", handleFulfillmentNotification);
};
