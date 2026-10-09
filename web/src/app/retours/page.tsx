import type { Metadata } from "next";
import { ServicePage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "Retours et garantie",
  description: "Conditions de retour, délai de 14 jours et garantie de deux ans sur le mobilier LUMA.",
};

export default function Page() {
  return <ServicePage kind="retours" />;
}
