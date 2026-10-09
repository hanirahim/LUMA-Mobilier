import type { Metadata } from "next";
import { AmbiancesPage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "Acheter cette ambiance",
  description: "Salle à manger, salon, chambre, bureau et espace professionnel. Ajoutez toute une ambiance LUMA au panier.",
};

export default function Page() {
  return <AmbiancesPage />;
}
