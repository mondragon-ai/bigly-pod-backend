import fetch from "node-fetch";
const URL = "https://api.shipengine.com/v1";
const HEADERS = {
  "Content-Type": "application/json",
  "API-key": "" + process.env.SHIP_ENGINE_API_KEY,
};

/**
 * Initial request function for the Shine On API
 * @param resource
 * @param method
 * @param data
 * @returns Response from fetch
 */
export const shipEngineAPIRequests = async (
  resource: string,
  method?: string,
  data?: any,
  headers?: Record<string, string> | null,
) => {
  // Prepare request options
  let options = {
    method: method,
    headers: headers ? headers : HEADERS,
  } as any;

  // Add body to options if method is POST
  if (method == "POST" && data) {
    options = {
      ...options,
      body: JSON.stringify(data),
    };
  }

  try {
    // Make request to Shopify
    const response = await fetch(URL + resource, options);

    // Check if response is ok (status in the range 200-299)
    if (!response.ok) {
      console.error(response);
      if (response.status === 422) {
        // Handle 422 error
        const errorData = await response.json();
        return errorData;
      } else if (response.status === 404) {
        // Handle 404 error
        const errorData = await response.json();
        return errorData;
      } else {
        throw new Error(response.statusText);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get shipping rate: ", {error});
    throw error;
  }
};
