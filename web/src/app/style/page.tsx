import type { Metadata } from "next";
import { StylePage } from "@/components/pages/experience";

export const metadata: Metadata = {
  title: "Trouvez votre style LUMA",
  description: "Minimaliste, naturel, contemporain, élégant ou chaleureux : une sélection de mobilier français LUMA.",
};

export default function Page() {
  return <StylePage />;
}
