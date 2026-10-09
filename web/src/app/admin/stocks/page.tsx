import type { Metadata } from "next";
import { AdminStocks } from "@/components/pages/admin";

export const metadata: Metadata = { title: "Stocks" };

export default function Page() {
  return <AdminStocks />;
}
