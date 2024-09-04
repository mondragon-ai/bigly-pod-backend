export type Status =
  | 500
  | 422
  | 403
  | 409
  | 401
  | 400
  | 404
  | 200
  | 201
  | 203
  | 204;

export type ServicesReponseType = {
  status: Status;
  data: any;
  error: boolean;
  text: string;
};

export interface Address {
  type: "BOTH" | "SHIPPING" | "BILLING";
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  name: string;
  title?: string;
  phone?: string;
}

export interface ShippingLines {
  id: string;
  title: string;
  price: number;
  custom?: true;
}
