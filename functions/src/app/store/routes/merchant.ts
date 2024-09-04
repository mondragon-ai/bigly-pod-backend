import * as express from "express";
import {
  handleDeleteMerchant,
  handleFetchingMerchant,
} from "../controllers/merchant";

export const merchantRoutes = (app: express.Router) => {
  app.get("/:domain/merchant", handleFetchingMerchant);
  app.delete("/:domain/merchant", handleDeleteMerchant);
};
