import type { Metadata } from "next";
import { AdminHome } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Atelier" };

export default function Page() {
  return <AdminHome />;
}
