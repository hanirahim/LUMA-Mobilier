import type { Metadata } from "next";
import { FaqPage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Livraison, paiement, retours, garantie, entretien, disponibilité et commandes professionnelles LUMA.",
};

export default function Page() {
  return <FaqPage />;
}
