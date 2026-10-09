import type { Metadata } from "next";
import { AdminClients } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Clients" };

export default function Page() {
  return <AdminClients />;
}
