import type { Metadata } from "next";
import { AdminReservations } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Réservations" };

export default function Page() {
  return <AdminReservations />;
}
