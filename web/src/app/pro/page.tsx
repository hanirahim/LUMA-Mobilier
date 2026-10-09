import type { Metadata } from "next";
import { ProPage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "LUMA PRO — mobilier professionnel",
  description: "Mobilier professionnel pour restaurants, hôtels, cafés, bureaux, architectes et événements. Demandez un devis LUMA.",
};

export default function Page() {
  return <ProPage />;
}
