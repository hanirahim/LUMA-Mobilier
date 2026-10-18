import "server-only";
import { createHmac } from "node:crypto";

/**
 * Alibaba.com Open Platform HTTP request signing (Developer Guide, docId=60).
 * Do not include "sign" or binary parameters in the signed parameter set.
 * The App Secret must remain server-side.
 */
export function signAlibabaRequest(
  apiPath: string,
  params: Record<string, string>,
  appSecret: string,
): string {
  if (!apiPath.startsWith("/") || apiPath.startsWith("//") || apiPath.includes("?")) {
    throw new Error("Invalid Alibaba API path");
  }
  if (!appSecret) throw new Error("Alibaba App Secret is missing");
  const canonical = Object.entries(params)
    .filter(([key]) => key !== "sign")
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, value]) => key + value)
    .join("");
  return createHmac("sha256", appSecret)
    .update(apiPath + canonical, "utf8")
    .digest("hex")
    .toUpperCase();
}


/** Build required system parameters and sign them for a server-side API call. */
export function buildAlibabaSignedParams(
  apiPath: string,
  businessParams: Record<string, string>,
  credentials: { appKey: string; appSecret: string },
  now: Date = new Date(),
): Record<string, string> {
  if (!credentials.appKey || !credentials.appSecret) throw new Error("Alibaba credentials missing");
  const params = {
    ...businessParams,
    app_key: credentials.appKey,
    timestamp: String(now.getTime()),
    sign_method: "sha256",
  };
  return { ...params, sign: signAlibabaRequest(apiPath, params, credentials.appSecret) };
}
