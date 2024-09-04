import * as functions from "firebase-functions";
import {rest} from "./rest";

const express = rest();

const settings: functions.RuntimeOptions = {
  memory: "512MB",
  timeoutSeconds: 120,
};

export const store = functions.runWith(settings).https.onRequest(express);
