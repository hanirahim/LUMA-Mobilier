import { readLejiangDrafts } from "@/lib/alibaba/firebase-supplier-drafts";
import staged from "@/lib/alibaba/hebei-lejiang-listing-drafts.json";
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

export const dynamic = "force-dynamic";

export default async function Page() {
  let items = staged.products;
  if(process.env.VERCEL_ENV==="preview") {
    try {const raw=await readLejiangDrafts() as {products?:typeof staged.products}|null;if(Array.isArray(raw?.products))items=raw.products;}catch{/* staged preview fallback */}
  }
  const home=items.filter(p=>["Chaises","Tabourets","Tables basses","Tables à manger","Porte-manteaux"].includes(p.originalCategory));
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <Catalogue />
    </Suspense>
    {process.env.VERCEL_ENV==="preview" && <section className="mx-auto max-w-6xl px-6 pb-20"><p className="text-xs uppercase tracking-[0.18em] text-wood">LUMA · Collection maison en préparation</p><h2 className="mt-3 font-serif text-4xl">Chaises et mobilier pour la maison</h2><p className="mt-4 text-sm text-ink/65">{home.length} modèles en cours de vérification. Prix et photographies à venir. Commande désactivée.</p><div className="mt-9 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{home.map(p=><article key={p.supplierProductId}><div className="relative flex aspect-[3/4] items-center justify-center rounded-2xl bg-sand/50"><span className="font-serif text-3xl tracking-widest text-ink/30">LUMA</span><span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs">En préparation</span></div><p className="mt-4 text-xs uppercase tracking-wider text-wood">{p.originalCategory}</p><h3 className="mt-2 font-serif text-2xl">{p.title}</h3><p className="mt-2 text-sm text-ink/60">Prix à venir · Non disponible à la vente</p></article>)}</div></section>}
  );
}
