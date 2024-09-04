export interface WebhookSubscriptionData {
  webhook: {
    id: number;
    address: string;
    topic: string;
    created_at: string;
    updated_at: string;
    format: string;
    fields: any[]; // You can replace 'any' with a more specific type if necessary
    metafield_namespaces: string[];
    api_version: string;
    private_metafield_namespaces: string[];
  };
}
