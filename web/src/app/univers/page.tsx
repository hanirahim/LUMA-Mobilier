import type { Metadata } from "next";
import { UniversPage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "L'Univers LUMA",
  description: "Décoration, aménagement, tendances mobilier, conseils et guides d'achat. Le magazine de la maison LUMA.",
};

export default function Page() {
  return <UniversPage />;
}
