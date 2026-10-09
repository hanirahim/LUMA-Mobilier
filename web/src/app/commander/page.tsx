import type { Metadata } from "next";
import { CheckoutPage } from "@/components/pages/checkout";

export const metadata: Metadata = { title: "Confirmation" };

export default function Page() {
  return <CheckoutPage />;
}
