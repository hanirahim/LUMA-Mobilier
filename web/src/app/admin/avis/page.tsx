import type { Metadata } from "next";
import { AdminReviews } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Avis" };

export default function Page() {
  return <AdminReviews />;
}
