import type { Metadata } from "next";
import { AdminRentals } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Locations" };

export default function Page() {
  return <AdminRentals />;
}
