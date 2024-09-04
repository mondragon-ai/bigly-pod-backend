import * as express from "express";
import {
  handleDeleteMockup,
  handleFetchingMockups,
  handleNextMockups,
  handlePreviousMockups,
} from "../controllers/mockups";

export const mockupsRoutes = (app: express.Router) => {
  app.get("/:domain/mockups", handleFetchingMockups);
  app.delete("/:domain/mockups", handleDeleteMockup);
  app.get(
    "/:domain/mockups/previous/:first_item_seconds",
    handlePreviousMockups,
  );
  app.get("/:domain/mockups/next/:last_item_seconds", handleNextMockups);
};
