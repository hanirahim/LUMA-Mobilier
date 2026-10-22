import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { searchAlibabaProductsPreview } from "@/lib/alibaba/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "Introuvable" }, { status: 404, headers });
  const expected = process.env.LUMA_ADMIN_KEY || "luma-atelier";
  const provided = request.headers.get("x-luma-admin") || "";
  if (!provided || Buffer.byteLength(expected) !== Buffer.byteLength(provided) || !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) {
    return NextResponse.json({ error: "Accès administrateur requis" }, { status: 403, headers });
  }
  const keyword = request.nextUrl.searchParams.get("q")?.trim() || "dining chair";
  if (keyword.length > 100) return NextResponse.json({ error: "Recherche trop longue" }, { status: 400, headers });
  try {
    const result = await searchAlibabaProductsPreview(keyword);
    const data = result && typeof result === "object" ? result as Record<string, unknown> : {};
    const findCount = (value: unknown, depth = 0): number | null => {
      if (depth > 4 || !value || typeof value !== "object") return null;
      if (Array.isArray(value)) return value.length;
      for (const [key, child] of Object.entries(value)) {
        if (/^(products|productList|items|list|product_list)$/i.test(key) && Array.isArray(child)) return child.length;
      }
      for (const child of Object.values(value)) {
        const count = findCount(child, depth + 1);
        if (count !== null) return count;
      }
      return null;
    };
    const apiError = data.error_response || data.error || null;
    return NextResponse.json({ ok: !apiError, keyword, apiResponded: true, resultCount: findCount(data), responseFields: Object.keys(data).slice(0, 12), apiErrorPresent: Boolean(apiError) }, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const reason = message.includes("authorization") ? "Autorisation Alibaba absente" : message.includes("credentials") ? "Configuration Alibaba absente" : message.includes("HTTP") ? "Erreur HTTP Alibaba" : "Test Alibaba indisponible";
    return NextResponse.json({ ok: false, keyword, error: reason }, { status: 502, headers });
  }
}
