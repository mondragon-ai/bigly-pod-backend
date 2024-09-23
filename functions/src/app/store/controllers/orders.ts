import * as express from "express";
import * as functions from "firebase-functions";
import {
  chargeAndFulfillOrder,
  deleteOrders,
  fetchNextOrderList,
  fetchOrders,
  fetchPreviousOrderList,
  processWholesale,
} from "../services/orders";

/**
 * Fetch the order(s) for the store
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleFetchingOrders = async (
  req: express.Request,
  res: express.Response,
) => {
  const order_id = req.query.id;
  const {domain} = req.params;
  const id = order_id && typeof order_id == "string" ? order_id : null;
  functions.logger.info(
    " 🛒 [/FETCH]: " + (id ? `${id}` : "all") + ` for ${domain}`,
  );

  // Get Orders
  const {data, status, text} = await fetchOrders(domain, id);

  return res.status(status).json({
    text: text,
    orders: data,
  });
};

/**
 * Delete an order for the store
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleDeleteOrder = async (
  req: express.Request,
  res: express.Response,
) => {
  const {id, orders} = req.query;
  const {domain} = req.params;

  const order_id = id && typeof id === "string" ? id : null;
  const order_list = orders ? (orders as string).split(",") : null;

  functions.logger.info(
    " 🛒 [/DELETE]: " + (order_list ? "order list" : id) + ` for ${domain}`,
  );

  const {status, text, error} = await deleteOrders(
    domain,
    order_id,
    order_list as string[],
  );

  return res.status(status < 300 ? 204 : status).json({text, error});
};

/**
 * Charge & fulfill an order for the store
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleOrderFulfill = async (
  req: express.Request,
  res: express.Response,
) => {
  const {id} = req.query;
  const {domain} = req.params;

  const order_id = id && typeof id === "string" ? id : "";

  functions.logger.info(" 💰 [/CHARGE]: " + order_id + ` for ${domain}`);

  const {status, text, error} = await chargeAndFulfillOrder(domain, order_id);

  return res.status(status).json({text, error});
};

/**
 * Fetch next list of order for the store-- if available
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleNextOrders = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, last_item_seconds} = req.params;

  const last_order = last_item_seconds ? last_item_seconds : null;

  functions.logger.info(" 🛒 [/NEXT]: " + `${last_order} for ${domain}`);

  const {status, text, error, data} = await fetchNextOrderList(
    domain,
    last_order,
  );

  return res.status(status).json({text, error, data});
};

/**
 * Fetch next list of order for the store-- if available
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handlePreviousOrders = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain, first_item_seconds} = req.params;

  const first_order = first_item_seconds ? first_item_seconds : null;

  functions.logger.info(" 🛒 [/PREVIOUS]: " + `${first_order} for ${domain}`);

  const {status, text, error, data} = await fetchPreviousOrderList(
    domain,
    first_order,
  );

  return res.status(status).json({text, error, data});
};

/**
 * Conroller for creating wholesale order
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export const handleWholesale = async (
  req: express.Request,
  res: express.Response,
) => {
  const {domain} = req.params;
  const {quantity, product_id, color, customer} = req.body;
  functions.logger.info(" 🛒 [/WHOLESALE]: " + `${product_id} for ${domain}`);

  const {status, text, error, result} = await processWholesale(
    domain,
    quantity,
    color,
    product_id,
    customer,
  );

  return res.status(status).json({text, error, data: result});
};
