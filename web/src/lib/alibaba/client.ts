import "server-only";
import type { AlibabaProduct, AlibabaIntegrationStatus } from "./types";

/**
 * Integration scaffold only: no undocumented API endpoint is called.
 * Never expose Alibaba secrets in browser code or NEXT_PUBLIC_ variables.
 */
export function alibabaStatus(): AlibabaIntegrationStatus {
  const configured = Boolean(process.env.ALIBABA_APP_KEY && process.env.ALIBABA_APP_SECRET);
  if (!configured) {
    return { configured: false, mode: "demo", message: "Alibaba credentials are not configured. Demo only." };
  }
  return { configured: true, mode: "pending-approval", message: "Credentials provided; API permissions and endpoints must still be verified." };
}

export async function fetchAlibabaProducts(): Promise<AlibabaProduct[]> {
  throw new Error("Alibaba product import is disabled until official API access and permitted endpoints are confirmed.");
}

export async function submitAlibabaSupplierOrder(): Promise<never> {
  throw new Error("Alibaba order submission is disabled until API approval, payment confirmation, and idempotency controls are implemented.");
}
