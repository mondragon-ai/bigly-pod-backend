import * as express from "express";
import {handleFetchingAnalytics} from "../controllers/analytics";

export const anlayticsRoutes = (app: express.Router) => {
  app.get("/:domain/analytics", handleFetchingAnalytics);
};
