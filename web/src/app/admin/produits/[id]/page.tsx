import type { Metadata } from "next";
import { ProductForm } from "@/components/product-form";

export const metadata: Metadata = { title: "Modifier une pièce" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductForm id={id} />;
}
