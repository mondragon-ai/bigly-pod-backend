import {
  analyticsSearch,
  fetchSubcollectionCollection,
} from "../../../database/firestore";
import {buildAnalyticProps} from "../../../lib/helpers/analytics";
import {TimeFrameProps} from "../../../lib/types/analytics";
import {ServicesReponseType} from "../../../lib/types/shared";
import {
  getDayStartUnixTimeStampFromTimezone,
  getMonthStartUnixTimeStampFromTimezone,
} from "../../../utils/time";

/**
 * Fetches orders for a given domain and optional order ID. If the order ID is provided, it fetches a specific order;
 * otherwise, it fetches all orders for that domain.
 * @param {string} domain - The domain identifier for the merchant.
 * @param {string} time_frame - Optional specific order ID to fetch.
 * @returns {Promise<ServicesReponseType>} An object containing the status, data array, error flag, and status text related to the fetch operation.
 */
export const fetchAnalytics = async (
  domain: string,
  time_frame: TimeFrameProps,
  timezone: string,
): Promise<ServicesReponseType> => {
  const res: ServicesReponseType = {
    status: 200,
    data: [],
    error: false,
    text: "Orders Fetched Sucessfully",
  };

  if (!domain || domain == "") {
    res.error = true;
    res.status = 404;
    res.text = "Merchant not present";
  }

  const today = getDayStartUnixTimeStampFromTimezone(
    timezone || "America/New_York",
  );
  const month = getMonthStartUnixTimeStampFromTimezone(
    timezone || "America/New_York",
  );

  switch (time_frame) {
    case "seven_days": {
      const seven_days = Math.abs(Math.round(today - 60 * 60 * 24 * 7));
      const seven = await analyticsSearch(
        "shopify_pod",
        domain,
        "daily_analytics",
        String(seven_days),
      );

      res.status = seven.status < 300 ? seven.status : 201;
      res.text = seven.status < 300 ? res.text : seven.text;
      res.data = seven.data
        ? seven.data
        : [buildAnalyticProps(timezone, today)];
      break;
    }
    case "thirty_days": {
      const thirty_days = Math.abs(Math.round(today - 60 * 60 * 24 * 30));
      const thirty = await analyticsSearch(
        "shopify_pod",
        domain,
        "daily_analytics",
        String(thirty_days),
      );

      res.status = thirty.status < 300 ? thirty.status : 201;
      res.text = thirty.status < 300 ? res.text : thirty.text;
      res.data = thirty.data
        ? thirty.data
        : [buildAnalyticProps(timezone, today)];
      break;
    }
    case "ninety_days": {
      const ninety_days = Math.abs(Math.round(today - 60 * 60 * 24 * 90));
      const nine = await analyticsSearch(
        "shopify_pod",
        domain,
        "monthly_analytics",
        String(ninety_days),
      );

      res.status = nine.status < 300 ? nine.status : 201;
      res.text = nine.status < 300 ? res.text : nine.text;
      res.data = nine.data ? nine.data : [buildAnalyticProps(timezone, month)];
      break;
    }
    case "twelve_months": {
      const twelve_months = Math.abs(Math.round(today - 60 * 60 * 24 * 365));
      const twelve = await analyticsSearch(
        "shopify_pod",
        domain,
        "monthly_analytics",
        String(twelve_months),
      );

      res.status = twelve.status < 300 ? twelve.status : 201;
      res.text = twelve.status < 300 ? res.text : twelve.text;
      res.data = twelve.data
        ? twelve.data
        : [buildAnalyticProps(timezone, month)];
      break;
    }
    default: {
      const {data, text, status} = await fetchSubcollectionCollection(
        "shopify_pod",
        domain,
        "daily_analytics",
      );

      res.status = status < 300 ? status : 201;
      res.text = status < 300 ? res.text : text;
      res.data = data ? data : [buildAnalyticProps(timezone, today)];
      break;
    }
  }

  return res;
};
