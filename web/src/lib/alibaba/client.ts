import "server-only";
import type { AlibabaProduct, AlibabaIntegrationStatus } from "./types";
import { readAlibabaTokensEncrypted } from "./firebase-token-store";
import { buildAlibabaSignedParams } from "./signature";

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

/**
 * Preview-only, read-only Alibaba product search.
 * The remote API uses a JSON-encoded param0 object with required
 * keyword, size and index. Never return or log the access token.
 * Not exposed through a public route; use only from trusted server code.
 */
export async function searchAlibabaProductsPreview(keyword: string): Promise<unknown> {
  if (process.env.VERCEL_ENV !== "preview") throw new Error("Preview only");
  if (!keyword.trim() || keyword.length > 100) throw new Error("Invalid search keyword");
  const tokens = await readAlibabaTokensEncrypted("preview_authorized_buyer");
  if (!tokens?.access_token) throw new Error("Alibaba authorization missing");
  const appKey = process.env.ALIBABA_APP_KEY;
  const appSecret = process.env.ALIBABA_APP_SECRET;
  if (!appKey || !appSecret) throw new Error("Alibaba credentials missing");
  const path = "/eco/buyer/product/search";
  const params = buildAlibabaSignedParams(path, {
    param0: JSON.stringify({
      keyword: keyword.trim(), size: 10, index: 1,
      shipToCountry: "FR", language: "fr", currency: "EUR",
    }),
  }, { appKey, appSecret });
  const url = new URL("https://openapi-api.alibaba.com/rest" + path);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: "GET",
    headers: { access_token: tokens.access_token, Accept: "application/json" },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Alibaba product search HTTP error");
  const raw = await response.text();
  if (raw.length > 256 * 1024) throw new Error("Alibaba response too large");
  return JSON.parse(raw) as unknown;
}
