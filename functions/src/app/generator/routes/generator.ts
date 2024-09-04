import * as express from "express";
import {handleMockupGenerator} from "../controllers/mockups";
import {handleProductCreate} from "../controllers/products";

export const generatorRoutes = (app: express.Router) => {
  app.post("/:domain/mockups/:shpat", handleMockupGenerator);
  app.post("/:domain/products/:shpat", handleProductCreate);
};
