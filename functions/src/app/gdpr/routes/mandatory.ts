import * as express from "express";
import {
  handleCustomerRedactGDPR,
  handleCustomerRequestGDPR,
  handleStoreRedactGDPR,
} from "../controllers/mandatory";

export const gdprRoutes = (app: express.Router) => {
  app.post(
    "/redact/store",
    express.raw({type: "application/json"}),
    handleStoreRedactGDPR,
  );
  app.post(
    "/redact/customer",
    express.raw({type: "application/json"}),
    handleCustomerRedactGDPR,
  );
  app.post(
    "/request/customer",
    express.raw({type: "application/json"}),
    handleCustomerRequestGDPR,
  );
};
