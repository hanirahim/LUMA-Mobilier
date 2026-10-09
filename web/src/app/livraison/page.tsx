import type { Metadata } from "next";
import { ServicePage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "Livraison",
  description: "Frais, délais et zones de livraison du mobilier LUMA en France métropolitaine.",
};

export default function Page() {
  return <ServicePage kind="livraison" />;
}
