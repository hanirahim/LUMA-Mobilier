import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à LUMA : formulaire, e-mail et conversation avec l'atelier.",
};

export default function Page() {
  return <ContactPage />;
}
