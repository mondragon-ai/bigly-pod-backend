import * as express from "express";
import * as cors from "cors";

import {gdprRoutes} from "./routes/mandatory";

// Routes
export const rest = () => {
  const app = express();
  app.use(cors({origin: true}));

  // * Middleware to capture raw body
  // app.use(
  //   express.json({
  //     verify: (req: any, res, buf, encoding) => {
  //       req.rawBody = buf;
  //     },
  //   }),
  // );

  // * Middleware to verify Shopify webhook
  // app.use((req: any, res, next) => {
  //   const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string;
  //   const secret = process.env.CLIENT_SECRET || "";
  //   const hash = crypto
  //     .createHmac("sha256", secret)
  //     .update(req.rawBody, "utf8")
  //     .digest("base64");

  //   if (crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader))) {
  //     next();
  //   } else {
  //     res.status(401).send("Unauthorized");
  //   }
  // });

  // Routes
  gdprRoutes(app);

  return app;
};
