import type { MetadataRoute } from "next";
import { readDb } from "@/lib/db";
import { scenes, universes } from "@/lib/world";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://luma.exemple.fr";
  const staticPaths = [
    "",
    "/catalogue",
    "/style",
    "/ambiances",
    "/univers",
    "/pro",
    "/contact",
    "/faq",
    "/livraison",
    "/retours",
    "/a-propos",
    "/conditions",
    "/confidentialite",
    "/inspiration",
    "/atelier",
  ];
  const products = readDb().products.map((product) => ({
    url: `${base}/produit/${product.slug}`,
    changeFrequency: "weekly" as const,
  }));
  return [
    ...staticPaths.map((path) => ({ url: `${base}${path || "/"}`, changeFrequency: "weekly" as const })),
    ...universes.map((item) => ({ url: `${base}/collections/${item.id}`, changeFrequency: "weekly" as const })),
    ...scenes.map((item) => ({ url: `${base}/ambiance/${item.slug}`, changeFrequency: "weekly" as const })),
    ...products,
  ];
}
