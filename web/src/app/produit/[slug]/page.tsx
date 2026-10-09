import type { Metadata } from "next";
import { ProductView } from "@/components/pages/product-view";
import { readDb } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = readDb().products.find((item) => item.slug === slug);
  return {
    title: product?.name ?? "Pièce",
    description: product?.description ?? "Mobilier contemporain français LUMA.",
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductView slug={slug} />;
}
