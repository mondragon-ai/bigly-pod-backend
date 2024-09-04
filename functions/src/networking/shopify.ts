import * as functions from "firebase-functions";
import fetch, {RequestInit} from "node-fetch";

/**
 * Initial request function for Shopify
 * @param data
 * @param token
 * @param shop
 * @returns Response from fetch or error message
 */
export const shopifyGraphQlRequest = async (
  shop: string,
  token: string,
  data: object,
) => {
  const URL = `https://${shop}.myshopify.com/admin/api/2023-07/graphql.json`;

  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": token as string,
  };

  try {
    // Prepare request options
    const options = {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    };

    // Make request to Shopify
    const response = await fetch(URL, options);

    // Handle different status codes
    if (response.status === 200) {
      // 200 OK - Successful response
      return await response.json();
    } else if (response.status === 201) {
      // 201 Created - New resource created
      return await response.json();
    } else if (response.status === 202) {
      // 202 Accepted - Request accepted but not yet processed
      return await response.json();
    } else if (response.status === 204 || response.status === 205) {
      // 204 No Content or 205 Reset Content - Accepted but no content
      return null;
    } else if (response.status === 303) {
      // 303 See Other - Redirect to a different URL
      const location = response.headers.get("Location");
      if (location) {
        // Perform a GET request to the new location
        const newResponse = await fetch(location);
        return await newResponse.json();
      }
    } else if (response.status === 400) {
      // 400 Bad Request - Invalid request or syntax
      return await response.json();
    } else if (response.status === 401) {
      // 401 Unauthorized - Authentication credentials are incorrect
      functions.logger.error(
        "401 - Unauthorized: Authentication credentials are incorrect.",
      );
      return null;
    } else if (response.status === 402) {
      // 402 Payment Required - Shop is frozen
      functions.logger.error(
        "402 - Payment Required: The shop is currently frozen.",
      );
      return null;
    } else if (response.status === 403) {
      // 403 Forbidden - Server refuses to respond
      functions.logger.error("403 - Forbidden: Server is refusing to respond.");
      return null;
    } else if (response.status === 404) {
      // 404 Not Found - Resource not found
      functions.logger.error(
        "404 - Not Found: The requested resource was not found.",
      );
      return null;
    } else if (response.status === 405) {
      // 405 Method Not Allowed - Server rejects HTTP method
      functions.logger.error(
        "405 - Method Not Allowed: The server rejects the HTTP method.",
      );
      return null;
    } else if (response.status === 406) {
      // 406 Not Acceptable - Resource cannot generate acceptable content
      functions.logger.error(
        "406 - Not Acceptable: The requested resource cannot generate acceptable content.",
      );
      return null;
    } else if (response.status === 409) {
      // 409 Resource Conflict - Requested resource conflict
      functions.logger.error(
        "409 - Resource Conflict: The requested resource couldn't be processed due to conflict.",
      );
      return null;
    } else if (response.status === 414) {
      // 414 URI Too Long - URI provided was too long
      functions.logger.error(
        "414 - URI Too Long: The server is refusing the request due to a long URI.",
      );
      return null;
    } else if (response.status === 415) {
      // 415 Unsupported Media Type - Unsupported payload format
      functions.logger.error(
        "415 - Unsupported Media Type: The server refuses the request due to an unsupported payload format.",
      );
      return null;
    } else if (response.status === 422) {
      // 422 Unprocessable Entity - Request body contains semantic errors
      functions.logger.error(
        "422 - Unprocessable Entity - Request body contains semantic errors",
      );
      const errorData = await response.json();
      return errorData;
    } else if (response.status === 423) {
      // 423 Locked - Shop is locked
      functions.logger.error(
        "423 - Locked: The requested shop is currently locked.",
      );
      return null;
    } else if (response.status === 429) {
      // 429 Too Many Requests - Rate limit exceeded
      functions.logger.error(
        "429 - Too Many Requests: The application has exceeded the rate limit.",
      );
      return null;
    } else if (response.status === 430) {
      // 430 Shopify Security Rejection - Request rejected for security reasons
      functions.logger.error(
        "430 - Security Rejection: The request was rejected for security reasons.",
      );
      return null;
    } else if (response.status === 500) {
      // 500 Internal Server Error - Internal error in Shopify
      functions.logger.error(
        "500 - Internal Server Error: An internal error occurred in Shopify.",
      );
      return null;
    } else if (response.status === 501) {
      // 501 Not Implemented - Requested endpoint not available
      functions.logger.error(
        "501 - Not Implemented: The requested endpoint is not available.",
      );
      return null;
    } else if (response.status === 502) {
      // 502 Bad Gateway - Invalid response from upstream server
      functions.logger.error(
        "502 - Bad Gateway: The server received an invalid response from the upstream server.",
      );
      return null;
    } else if (response.status === 503) {
      // 503 Service Unavailable - Server is currently unavailable
      functions.logger.error(
        "503 - Service Unavailable: The server is currently unavailable.",
      );
      return null;
    } else if (response.status === 504) {
      // 504 Gateway Timeout - Request couldn't complete in time
      functions.logger.error(
        "504 - Gateway Timeout: The request couldn't complete in time.",
      );
      return null;
    } else if (response.status === 530) {
      // 530 Origin DNS Error - DNS resolution error
      functions.logger.error(
        "530 - Origin DNS Error: Cloudflare can't resolve the requested DNS record.",
      );
      return null;
    } else if (response.status === 540) {
      // 540 Temporarily Disabled - Endpoint temporarily disabled
      functions.logger.error(
        "540 - Temporarily Disabled: The requested endpoint is temporarily disabled.",
      );
      return null;
    } else if (response.status === 783) {
      // 783 Unexpected Token - Unexpected token in response
      functions.logger.error(
        "783 - Unexpected Token: An unexpected token was encountered.",
      );
      return null;
    } else {
      // Handle other status codes as needed
      functions.logger.error("Not OK Status: ", response.statusText);
      return null;
    }
    // Handle other status codes as needed
    functions.logger.error("Not OK Status: ", response.statusText);
    return null;
  } catch (error) {
    functions.logger.error("Failed to fetch from Shopify: ", {error});
    return null;
  }
};

/**
 * Initial request function for Shopify
 * @param resource
 * @param method
 * @param data
 * @param token
 * @param shop
 * @returns Response from fetch or error message
 */
export const shopifyRequest = async (
  resource: string,
  method: string,
  data?: object | null,
  token?: string,
  shop?: string,
) => {
  const URL = `https://${shop}.myshopify.com/admin/api/2023-04/`;

  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": token as string,
  };

  try {
    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
    };

    // Add body to options if method is POST
    if (data !== null) {
      options.body = JSON.stringify(data);
    }

    // Make request to Shopify
    const response = await fetch(URL + resource, options);

    if (!response.ok) {
      functions.logger.warn({resource, method, data, token, shop});
    }

    // Handle different status codes
    if (response.status === 200) {
      // 200 OK - Successful response
      return await response.json();
    } else if (response.status === 201) {
      // 201 Created - New resource created
      return await response.json();
    } else if (response.status === 202) {
      // 202 Accepted - Request accepted but not yet processed
      return await response.json();
    } else if (response.status === 204 || response.status === 205) {
      // 204 No Content or 205 Reset Content - Accepted but no content
      return null;
    } else if (response.status === 303) {
      // 303 See Other - Redirect to a different URL
      const location = response.headers.get("Location");
      if (location) {
        // Perform a GET request to the new location
        const newResponse = await fetch(location);
        return await newResponse.json();
      }
    } else if (response.status === 400) {
      // 400 Bad Request - Invalid request or syntax
      return await response.json();
    } else if (response.status === 401) {
      // 401 Unauthorized - Authentication credentials are incorrect
      functions.logger.error(
        "401 - Unauthorized: Authentication credentials are incorrect.",
      );
      return null;
    } else if (response.status === 402) {
      // 402 Payment Required - Shop is frozen
      functions.logger.error(
        "402 - Payment Required: The shop is currently frozen.",
      );
      return null;
    } else if (response.status === 403) {
      // 403 Forbidden - Server refuses to respond
      functions.logger.error("403 - Forbidden: Server is refusing to respond.");
      return null;
    } else if (response.status === 404) {
      // 404 Not Found - Resource not found
      functions.logger.error(
        "404 - Not Found: The requested resource was not found.",
      );
      return null;
    } else if (response.status === 405) {
      // 405 Method Not Allowed - Server rejects HTTP method
      functions.logger.error(
        "405 - Method Not Allowed: The server rejects the HTTP method.",
      );
      return null;
    } else if (response.status === 406) {
      const result = await response.json();
      // 406 Not Acceptable - Resource cannot generate acceptable content
      functions.logger.error({result});
      functions.logger.error(
        "406 - Not Acceptable: The requested resource cannot generate acceptable content.",
      );
      return null;
    } else if (response.status === 409) {
      // 409 Resource Conflict - Requested resource conflict
      functions.logger.error(
        "409 - Resource Conflict: The requested resource couldn't be processed due to conflict.",
      );
      return null;
    } else if (response.status === 414) {
      // 414 URI Too Long - URI provided was too long
      functions.logger.error(
        "414 - URI Too Long: The server is refusing the request due to a long URI.",
      );
      return null;
    } else if (response.status === 415) {
      // 415 Unsupported Media Type - Unsupported payload format
      functions.logger.error(
        "415 - Unsupported Media Type: The server refuses the request due to an unsupported payload format.",
      );
      return null;
    } else if (response.status === 422) {
      functions.logger.error(`422 -  ${await response.text()}`);
      const errorData = await response.json();
      return errorData;
    } else if (response.status === 423) {
      // 423 Locked - Shop is locked
      functions.logger.error(
        "423 - Locked: The requested shop is currently locked.",
      );
      return null;
    } else if (response.status === 429) {
      // 429 Too Many Requests - Rate limit exceeded
      functions.logger.error(
        "429 - Too Many Requests: The application has exceeded the rate limit.",
      );
      return null;
    } else if (response.status === 430) {
      // 430 Shopify Security Rejection - Request rejected for security reasons
      functions.logger.error(
        "430 - Security Rejection: The request was rejected for security reasons.",
      );
      return null;
    } else if (response.status === 500) {
      // 500 Internal Server Error - Internal error in Shopify
      functions.logger.error(
        "500 - Internal Server Error: An internal error occurred in Shopify.",
      );
      return null;
    } else if (response.status === 501) {
      // 501 Not Implemented - Requested endpoint not available
      functions.logger.error(
        "501 - Not Implemented: The requested endpoint is not available.",
      );
      return null;
    } else if (response.status === 502) {
      // 502 Bad Gateway - Invalid response from upstream server
      functions.logger.error(
        "502 - Bad Gateway: The server received an invalid response from the upstream server.",
      );
      return null;
    } else if (response.status === 503) {
      // 503 Service Unavailable - Server is currently unavailable
      functions.logger.error(
        "503 - Service Unavailable: The server is currently unavailable.",
      );
      return null;
    } else if (response.status === 504) {
      // 504 Gateway Timeout - Request couldn't complete in time
      functions.logger.error(
        "504 - Gateway Timeout: The request couldn't complete in time.",
      );
      return null;
    } else if (response.status === 530) {
      // 530 Origin DNS Error - DNS resolution error
      functions.logger.error(
        "530 - Origin DNS Error: Cloudflare can't resolve the requested DNS record.",
      );
      return null;
    } else if (response.status === 540) {
      // 540 Temporarily Disabled - Endpoint temporarily disabled
      functions.logger.error(
        "540 - Temporarily Disabled: The requested endpoint is temporarily disabled.",
      );
      return null;
    } else if (response.status === 783) {
      // 783 Unexpected Token - Unexpected token in response
      functions.logger.error(
        "783 - Unexpected Token: An unexpected token was encountered.",
      );
      return null;
    } else {
      // Handle other status codes as needed
      functions.logger.error("Not OK Status: ", response.statusText);
      return null;
    }
    // Handle other status codes as needed
    functions.logger.error("Not OK Status: ", response.statusText);
    return null;
  } catch (error) {
    functions.logger.error("Failed to fetch from Shopify: ", {error});
    return null;
  }
};
