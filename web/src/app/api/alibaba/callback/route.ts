import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { exchangeAlibabaAuthorizationCode } from "@/lib/alibaba/token";
import { readAlibabaTokensEncrypted, saveAlibabaTokensEncrypted } from "@/lib/alibaba/firebase-token-store";

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
    // Explicit Preview-only activation: never exchange a code on production by accident.
    if (process.env.VERCEL_ENV !== "preview" ||
        process.env.ALIBABA_OAUTH_TOKEN_EXCHANGE_ENABLED !== "true") {
      return reply("Retour OAuth vérifié. Échange du code contre un jeton non encore activé.", 503);
    }
    const callbackUrl = process.env.ALIBABA_OAUTH_REDIRECT_URI;
    if (!callbackUrl || new URL(callbackUrl).origin !== request.nextUrl.origin ||
        new URL(callbackUrl).pathname !== "/api/alibaba/callback") {
      return reply("Configuration du retour OAuth invalide.", 503);
    }
    try {
      // Single-buyer Preview integration: OAuth state ties the callback to the
      // browser that initiated authorization. Alibaba does not guarantee an
      // account identifier in its token response. Never derive one from a
      // browser parameter or the token itself.
      const storageKey = "preview_authorized_buyer";
      const existing = await readAlibabaTokensEncrypted(storageKey);
      if (existing) {
        return reply("Un compte Alibaba est déjà enregistré sur cette version de test. Aucun jeton remplacé.", 409);
      }
      const tokens = await exchangeAlibabaAuthorizationCode(params.get("code")!);
      await saveAlibabaTokensEncrypted(storageKey, tokens);
      return reply("Compte Alibaba autorisé. Jetons enregistrés de façon chiffrée.", 200);
    } catch {
      // Never expose authorization codes, tokens, provider payloads or secrets.
      return reply("Connexion Alibaba incomplète : échange ou stockage sécurisé impossible. Réessayez plus tard.", 503);
    }
  }
  return reply("Route de retour Alibaba accessible. Connexion OAuth non activée.", 200);
}
