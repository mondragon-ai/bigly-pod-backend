export type SubscriptionLineItem = {
  balanceUsed: number;
  cappedAmount: number;
  id: string;
};

export type ActiveSubscription = {
  name: string;
  lineItems: {
    id: string;
    plan: {
      id: string;
      pricingDetails: {
        terms: string;
        balanceUsed: {amount: string};
        cappedAmount: {amount: string};
      };
    };
  }[];
};

export type CurrentAppInstallType = {
  data: {
    currentAppInstallation: {
      activeSubscriptions: ActiveSubscription[];
    };
  };
};

export type ShopifyCreateUsageChargeResponse = {
  data: {
    appUsageRecordCreate: {
      appUsageRecord: {
        id: string;
      };
      userErrors: any[]; // Replace `any` with a specific error type if known
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
};
