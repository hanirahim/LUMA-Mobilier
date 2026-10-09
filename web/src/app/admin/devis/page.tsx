import type { Metadata } from "next";
import { AdminQuotes } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Devis" };

export default function Page() {
  return <AdminQuotes />;
}
