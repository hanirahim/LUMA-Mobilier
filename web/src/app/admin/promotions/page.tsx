import type { Metadata } from "next";
import { AdminPromotions } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Promotions" };

export default function Page() {
  return <AdminPromotions />;
}
