import type { Metadata } from "next";
import { ProductForm } from "@/components/product-form";

export const metadata: Metadata = { title: "Nouvelle pièce" };

export default function Page() {
  return <ProductForm />;
}
