import type { Metadata } from "next";
import { AdminCategories } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Catégories" };

export default function Page() {
  return <AdminCategories />;
}
