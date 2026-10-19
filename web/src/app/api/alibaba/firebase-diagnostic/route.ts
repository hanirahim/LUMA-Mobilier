import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseConnection, readAlibabaTokensEncrypted } from "@/lib/alibaba/firebase-token-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Explicitly authenticated Preview-only connectivity test.
 * Set FIREBASE_DIAGNOSTIC_TOKEN to a unique random secret in Vercel Preview.
 * Never put the diagnostic secret in a URL or send it in chat.
 */
export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Diagnostic protégé : utilisez POST avec le jeton dans l’en-tête x-firebase-diagnostic-token. Aucun test Firebase n’a été exécuté." },
    { status: 200, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Allow": "GET, POST" } },
  );
}

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ ok: false, message: "Unavailable" }, { status: 404, headers });
  }
  const expected = process.env.FIREBASE_DIAGNOSTIC_TOKEN;
  const provided = request.headers.get("x-firebase-diagnostic-token") || "";
  if (!expected || expected.length < 32 || provided.length !== expected.length ||
      !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401, headers });
  }
  try {
    await verifyFirebaseConnection();
    const stored = await readAlibabaTokensEncrypted("preview_authorized_buyer");
    if (!stored?.access_token) return NextResponse.json({ ok: false, message: "Jeton Alibaba absent" }, { status: 404, headers });
    return NextResponse.json({ ok: true, message: "Firebase accessible" }, { headers });
  } catch {
    return NextResponse.json({ ok: false, message: "Firebase connection failed" }, { status: 503, headers });
  }
}
