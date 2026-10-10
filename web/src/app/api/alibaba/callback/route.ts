import { NextRequest, NextResponse } from "next/server";

/**
 * Alibaba.com OAuth callback — connectivity scaffold only.
 *
 * This route deliberately does not accept authorization codes yet.
 * Before enabling OAuth: initiate authorization server-side, generate a
 * cryptographically random state, store it in a secure HttpOnly SameSite=Lax
 * cookie or durable session, verify it here, and exchange the code on the
 * server using Alibaba.com's approved API documentation.
 *
 * Never log or expose codes, tokens, App Key or App Secret.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(message: string, status: number) {
  return NextResponse.json(
    { integration: "alibaba", message, authorizationEnabled: false },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  if (params.has("code") || params.has("state") || params.has("error")) {
    // Do not consume a real authorization response without verified state.
    return reply(
      "Autorisation Alibaba non activée : aucun code n'a été traité ni enregistré.",
      503,
    );
  }

  return reply(
    "Route de retour Alibaba accessible. Connexion OAuth non activée.",
    200,
  );
}
