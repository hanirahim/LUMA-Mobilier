import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogue } from "@/components/pages/catalogue";
import { categoryLabel } from "@/lib/format";
import type { CategoryId } from "@/lib/types";

const descriptions: Record<CategoryId, string> = {
  chaises: "Chaises contemporaines françaises LUMA, pour la salle à manger et le salon.",
  tables: "Tables contemporaines françaises LUMA, pour manger, travailler et recevoir.",
  tabourets: "Tabourets contemporains LUMA, pour le comptoir, le salon et le bureau.",
  lits: "Lits contemporains français LUMA, pour des chambres calmes et confortables.",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}): Promise<Metadata> {
  const { categorie } = await searchParams;
  const category = categorie && categorie in descriptions ? (categorie as CategoryId) : null;
  return {
    title: category ? categoryLabel[category] : "Mobilier contemporain français",
    description: category
      ? descriptions[category]
      : "Chaises, tables, tabourets et lits. Mobilier contemporain français LUMA, pour la maison et les projets professionnels.",
  };
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <Catalogue />
    </Suspense>
  );
}
