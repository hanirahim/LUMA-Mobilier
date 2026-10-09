import type { Metadata } from "next";
import { AdminOrders } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Commandes" };

export default function Page() {
  return <AdminOrders />;
}
