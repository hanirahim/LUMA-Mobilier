import type { Metadata } from "next";
import { ServicePage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment LUMA utilise les données de compte, de commande et de devis.",
};

export default function Page() {
  return <ServicePage kind="confidentialite" />;
}
