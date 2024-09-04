import {Status} from "./shared";

export type FirestoreResponse = {
  text: string;
  status: Status;
  data: null | any;
};
