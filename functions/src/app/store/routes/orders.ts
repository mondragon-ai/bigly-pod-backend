import * as express from "express";
import {
  handleDeleteOrder,
  handleFetchingOrders,
  handleNextOrders,
  handlePreviousOrders,
  handleWholesale,
  handleOrderFulfill,
} from "../controllers/orders";

export const ordersRoutes = (app: express.Router) => {
  app.get("/:domain/orders", handleFetchingOrders);
  app.post("/:domain/orders", handleWholesale);
  app.delete("/:domain/orders", handleDeleteOrder);
  app.post("/:domain/orders/fulfill", handleOrderFulfill);
  app.get("/:domain/orders/previous/:first_item_seconds", handlePreviousOrders);
  app.get("/:domain/orders/next/:last_item_seconds", handleNextOrders);
};
