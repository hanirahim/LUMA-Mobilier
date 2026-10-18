import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(message: string, status: number) {
  const response = NextResponse.json(
    { integration: "alibaba", message, authorizationEnabled: false },
    { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" } },
  );
  response.cookies.set("alibaba_oauth_state", "", {
    httpOnly: true, secure: true, sameSite: "lax", path: "/api/alibaba/callback", maxAge: 0,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.has("error")) {
    return reply("Alibaba a refusé ou interrompu l'autorisation. Aucun jeton enregistré.", 400);
  }
  if (params.has("code") || params.has("state")) {
    const supplied = params.get("state") || "";
    const expected = request.cookies.get("alibaba_oauth_state")?.value || "";
    const valid = supplied.length === 64 && expected.length === 64 &&
      timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
    if (!valid) return reply("Échec de vérification de sécurité OAuth (state). Aucun code traité.", 400);
    if (!params.get("code")) return reply("Réponse Alibaba incomplète : code manquant.", 400);
    // The authorization code is deliberately not exchanged or logged until the
    // official Alibaba token endpoint and durable encrypted storage are implemented.
    return reply("Retour OAuth vérifié. Échange du code contre un jeton non encore activé.", 503);
  }
  return reply("Route de retour Alibaba accessible. Connexion OAuth non activée.", 200);
}
