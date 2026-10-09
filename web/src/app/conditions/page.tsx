import type { Metadata } from "next";
import { ServicePage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "Conditions générales",
  description: "Conditions de vente du mobilier neuf LUMA. Livraison, paiement et confirmation.",
};

export default function Page() {
  return <ServicePage kind="conditions" />;
}
