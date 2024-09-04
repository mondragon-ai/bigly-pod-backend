import * as functions from "firebase-functions";
import {ShopData} from "../lib/types/shopify/shop";
import {createRootDocument, updateRootDocument} from "../database/firestore";

const settings: functions.RuntimeOptions = {
  timeoutSeconds: 120,
};

export const shopUpdate = functions
  .runWith(settings)
  .pubsub.topic("shop-update")
  .onPublish(async (message) => {
    // Extract Data from Order
    const shop = (await message.json) as unknown as ShopData;
    const {myshopify_domain, domain} = shop;
    functions.logger.info({myshopify_domain, domain});
    functions.logger.info({shop});

    if (!myshopify_domain || !domain) {
      return;
    }

    if (myshopify_domain !== domain) {
      // Update Shopify Document
      await updateRootDocument("shopify_pod", myshopify_domain, {
        custom_domain: domain,
      });

      // Create New Map Document
      await createRootDocument("domain_map", domain, {
        myshopify_domain: myshopify_domain,
        custom_domain: domain,
        id: domain,
      });

      // ? Double check this is the custom domain
    }
  });
