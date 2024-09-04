import * as express from "express";
import * as bearer from "express-bearer-token";
import * as bodyParser from "body-parser";
import * as cors from "cors";

// Routes
import {ordersRoutes} from "./routes/orders";
import {mockupsRoutes} from "./routes/mockups";
import {merchantRoutes} from "./routes/merchant";
import {appRoutes} from "./routes/app";
import {anlayticsRoutes} from "./routes/analytics";

export const rest = () => {
  const app = express();

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(express.json());
  app.use(bearer());
  app.use(cors({origin: true}));

  // CRUD Routes Here
  ordersRoutes(app);
  mockupsRoutes(app);
  merchantRoutes(app);
  appRoutes(app);
  anlayticsRoutes(app);

  return app;
};
