import type { Metadata } from "next";
import { ServicePage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "À propos",
  description: "LUMA, maison française de mobilier contemporain. Chaises, tables, tabourets et lits.",
};

export default function Page() {
  return <ServicePage kind="propos" />;
}
