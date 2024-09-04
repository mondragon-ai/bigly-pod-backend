import * as functions from "firebase-functions";
import {rest} from "./rest";

const express = rest();

const settings: functions.RuntimeOptions = {
  memory: "512MB",
  timeoutSeconds: 360,
};

export const generate = functions.runWith(settings).https.onRequest(express);
