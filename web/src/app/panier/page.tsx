import type { Metadata } from "next";
import { CartPage } from "@/components/pages/cart";

export const metadata: Metadata = { title: "Panier" };

export default function Page() {
  return <CartPage />;
}
