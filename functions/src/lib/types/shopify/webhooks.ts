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

interface Webhook {
  id: number;
  address: string;
  topic: string;
  created_at: string;
  updated_at: string;
  format: string;
  fields: any[]; // Adjust the type as necessary based on what fields can contain
  metafield_namespaces: any[]; // Adjust the type as necessary based on what metafield_namespaces can contain
  api_version: string;
  private_metafield_namespaces: any[]; // Adjust the type as necessary
}

export interface WebhooksResponse {
  webhooks: Webhook[];
}
