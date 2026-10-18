import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Starts Alibaba OAuth only when the official authorization URL is configured.
 * Set ALIBABA_OAUTH_AUTHORIZE_URL to the verified Alibaba authorization endpoint.
 * No secret, access token, or authorization code is sent to the browser.
 */
export async function GET(request: Request) {
  const appKey = process.env.ALIBABA_APP_KEY?.trim();
  const authorizeUrl = process.env.ALIBABA_OAUTH_AUTHORIZE_URL?.trim();
  const callbackUrl = process.env.ALIBABA_OAUTH_REDIRECT_URI?.trim();
  if (!appKey || !authorizeUrl || !callbackUrl) {
    return NextResponse.json(
      { integration: "alibaba", message: "OAuth non configuré : URL d'autorisation et URL de retour officielles requises.", authorizationEnabled: false },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  let destination: URL;
  try {
    destination = new URL(authorizeUrl);
    const callback = new URL(callbackUrl);
    if (destination.protocol !== "https:" || callback.protocol !== "https:" ||
        callback.pathname !== "/api/alibaba/callback" ||
        callback.origin !== new URL(request.url).origin) throw new Error("Invalid OAuth URLs");
  } catch {
    return NextResponse.json({ integration: "alibaba", message: "Configuration OAuth invalide.", authorizationEnabled: false }, { status: 503 });
  }

  const state = randomBytes(32).toString("hex");
  destination.searchParams.set("client_id", appKey);
  destination.searchParams.set("redirect_uri", callbackUrl);
  destination.searchParams.set("response_type", "code");
  destination.searchParams.set("state", state);

  const response = NextResponse.redirect(destination, { status: 302 });
  response.cookies.set("alibaba_oauth_state", state, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/api/alibaba/callback", maxAge: 600,
  });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
