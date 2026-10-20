import { NextRequest, NextResponse } from "next/server";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { searchAlibabaProductsPreview } from "@/lib/alibaba/client";
import { readAlibabaTokensEncrypted, saveAlibabaTokensEncrypted } from "@/lib/alibaba/firebase-token-store";
import { refreshAlibabaAccessToken } from "@/lib/alibaba/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const cookieName = "luma_alibaba_test_csrf";
function isPreview(request: NextRequest) {
  const expected = process.env.ALIBABA_OAUTH_REDIRECT_URI;
  if (process.env.VERCEL_ENV !== "preview" || !expected) return false;
  try { return new URL(expected).origin === request.nextUrl.origin; } catch { return false; }
}
export async function GET(request: NextRequest) {
  if (!isPreview(request)) return NextResponse.json({ ok: false }, { status: 404, headers });
  const csrf = randomBytes(32).toString("hex");
  const response = NextResponse.json({ csrf }, { headers });
  response.cookies.set(cookieName, csrf, { httpOnly: true, secure: true, sameSite: "strict", path: "/api/alibaba/connection-test", maxAge: 300 });
  return response;
}
export async function POST(request: NextRequest) {
  if (!isPreview(request)) return NextResponse.json({ ok: false }, { status: 404, headers });
  if (request.headers.get("origin") !== request.nextUrl.origin ||
      request.headers.get("sec-fetch-site") !== "same-origin" ||
      request.headers.get("content-type")?.split(";")[0] !== "application/json") {
    return NextResponse.json({ ok: false, status: "request_denied" }, { status: 403, headers });
  }
  const supplied = request.headers.get("x-csrf-token") || "";
  const expected = request.cookies.get(cookieName)?.value || "";
  if (supplied.length !== 64 || expected.length !== 64 ||
      !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
    return NextResponse.json({ ok: false, status: "request_denied" }, { status: 403, headers });
  }
  try {
    const stored = await readAlibabaTokensEncrypted("preview_authorized_buyer");
    if (!stored?.access_token) return NextResponse.json({ ok: false, status: "authorization_missing" }, { headers });
    let result = await searchAlibabaProductsPreview("furniture");
    const initial = result && typeof result === "object" ? result as Record<string, unknown> : {};
    const initialCode = initial.code ?? (initial.result && typeof initial.result === "object"
      ? (initial.result as Record<string, unknown>).code : undefined);
    let refreshed = false;
    if (initialCode === "IllegalAccessToken") {
      if (!stored.refresh_token) {
        return NextResponse.json({ ok: false, status: "refresh_unavailable", code: "IllegalAccessToken" }, { headers });
      }
      try {
        const renewed = await refreshAlibabaAccessToken(stored.refresh_token);
        await saveAlibabaTokensEncrypted("preview_authorized_buyer", {
          ...stored, ...renewed,
          refresh_token: renewed.refresh_token || stored.refresh_token,
        });
        refreshed = true;
        result = await searchAlibabaProductsPreview("furniture");
      } catch {
        return NextResponse.json({ ok: false, status: "refresh_failed", code: "IllegalAccessToken" }, { headers });
      }
    }
    if (!result || typeof result !== "object") return NextResponse.json({ ok: false, status: "invalid_response" }, { headers });
    const data = result as Record<string, unknown>;
    const nested = data.result && typeof data.result === "object" ? data.result as Record<string, unknown> : {};
    const code = nested.code ?? data.code;
    const inner = nested.result && typeof nested.result === "object"
      ? nested.result as Record<string, unknown> : {};
    const innerCode = inner.code ?? nested.result_code ?? data.result_code;
    const success = ["0", "200"].includes(String(code)) ||
      ["0", "200"].includes(String(innerCode)) ||
      nested.success === true || data.success === true;
    // Only short, well-formed provider status codes are shown. Never echo
    // arbitrary provider messages, product data, tokens or request identifiers.
    const safeCode = (value: unknown) => {
      const candidate = typeof value === "string" || typeof value === "number" ? String(value) : "";
      return /^[A-Za-z][A-Za-z0-9_.-]{0,31}$|^[0-9]{1,6}$/.test(candidate) ? candidate : null;
    };
    return NextResponse.json({ ok: success, status: success ? "accepted" : "api_rejected",
      code: safeCode(code), detailCode: safeCode(innerCode), refreshed }, { headers });
  } catch {
    return NextResponse.json({ ok: false, status: "request_failed" }, { headers });
  }
}
