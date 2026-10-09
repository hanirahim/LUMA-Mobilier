import type { Metadata } from "next";
import { AdminProducts } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Produits" };

export default function Page() {
  return <AdminProducts />;
}
