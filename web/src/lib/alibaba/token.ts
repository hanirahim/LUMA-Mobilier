import "server-only";
import { buildAlibabaSignedParams } from "./signature";

const API_ORIGIN = "https://openapi-api.alibaba.com";
const MAX_RESPONSE_BYTES = 64 * 1024;

export type AlibabaTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number | string;
  refresh_expires_in?: number | string;
  expire_time?: number | string;
  refresh_token_valid_time?: number | string;
  account_platform?: string;
  user_id?: string;
  havana_id?: string;
};

/**
 * Exchanges a short-lived OAuth authorization code for tokens.
 * Server-only: callers must persist the response encrypted and must never
 * log, expose in JSON routes, or send tokens to the browser.
 * This helper is not wired to the public OAuth callback until secure
 * durable token storage and authorized account binding exist.
 */
export async function exchangeAlibabaAuthorizationCode(code: string): Promise<AlibabaTokenResponse> {
  if (!code || code.length > 4096) throw new Error("Invalid Alibaba authorization code");
  const appKey = process.env.ALIBABA_APP_KEY?.trim();
  const appSecret = process.env.ALIBABA_APP_SECRET?.trim();
  if (!appKey || !appSecret) throw new Error("Alibaba server credentials not configured");

  const path = "/auth/token/create";
  const params = buildAlibabaSignedParams(
    path, { code, simplify: "true" }, { appKey, appSecret },
  );
  const response = await fetch(API_ORIGIN + "/rest" + path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", Accept: "application/json" },
    body: new URLSearchParams(params).toString(),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("Alibaba token request failed (HTTP " + response.status + ")");
  const length = Number(response.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_RESPONSE_BYTES) throw new Error("Alibaba response too large");
  const raw = await response.text();
  if (raw.length > MAX_RESPONSE_BYTES) throw new Error("Alibaba response too large");
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { throw new Error("Invalid Alibaba token response"); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid Alibaba token response");
  const data = payload as Record<string, unknown>;
  if (typeof data.access_token !== "string" || !data.access_token) {
    // Avoid including provider payload, which may contain sensitive data.
    throw new Error("Alibaba did not return an access token");
  }
  return data as AlibabaTokenResponse;
}
