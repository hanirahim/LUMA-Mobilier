/** Normalized product data from an authorized Alibaba.com integration. */
export type AlibabaProduct = {
  supplierProductId: string;
  supplierName?: string;
  supplierUrl: string;
  title: string;
  description: string;
  images: string[];
  currency: string;
  unitPrice: number;
  minimumOrderQuantity?: number;
  availableQuantity?: number;
  variants?: Array<{ id: string; label: string; supplierSku?: string }>;
};

export type AlibabaOrderRequest = {
  externalOrderId: string;
  supplierProductId: string;
  quantity: number;
  variantId?: string;
};

export type AlibabaIntegrationStatus =
  | { configured: false; mode: "demo"; message: string }
  | { configured: true; mode: "pending-approval"; message: string };
