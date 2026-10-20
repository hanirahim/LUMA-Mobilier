import { readSupplierDrafts } from "@/lib/alibaba/firebase-supplier-drafts";
import ImportSupplierButton from "./import-button";
import { lumaDraftName } from "@/lib/alibaba/luma-display";
import { DG_OUTDOOR_CATEGORIES } from "@/lib/alibaba/dg-outdoor";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Aperçu fournisseur — LUMA", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
type Draft = { supplierProductId:string; supplierUrl:string; originalCategory:string; title:string; supplierPriceRange:{min:number;max:number}; minimumOrderQuantity:number };
export default async function SupplierPreview() {
 let products:Draft[]=[];
 let error=false;
 try { const data=await readSupplierDrafts();if(data && typeof data==="object" && "products" in data && Array.isArray(data.products)) products=data.products as Draft[]; } catch { error=true; }
 const drafts={products};
 const groups = DG_OUTDOOR_CATEGORIES.filter(c => drafts.products.some(p => p.originalCategory === c.supplier));
 return <main className="mx-auto max-w-6xl px-6 py-12">
 <p className="text-sm uppercase tracking-widest">LUMA · Version de test</p>
 <h1 className="mt-3 text-4xl font-semibold">Mobilier de jardin — collection LUMA</h1>
 <p className="mt-5 text-stone-600">{drafts.products.length} pièces de mobilier en préparation. Collection en cours de préparation. Aucun achat possible.</p>
 {products.length===0 && <><p className="mt-5 text-sm">Les articles ne sont pas encore enregistrés dans Firebase. Utilisez le bouton pour importer les brouillons.</p><ImportSupplierButton />{error&&<p className="text-red-700">Firebase est momentanément inaccessible.</p>}</>}
 <p className="mt-4 rounded-lg border p-4 text-sm">Visuels définitifs et caractéristiques en cours de validation.</p>
 <nav className="my-8 flex flex-wrap gap-3">{groups.map(c => <a className="rounded-full border px-4 py-2 text-sm" href={`#${c.slug}`} key={c.slug}>{c.label}</a>)}</nav>
 {groups.map(c => <section id={c.slug} key={c.slug} className="mb-12"><h2 className="mb-5 text-2xl font-semibold">{c.label}</h2><div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
 {drafts.products.filter(p => p.originalCategory === c.supplier).map(p => <article key={p.supplierProductId} className="group">
 <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[1.4rem] bg-sand/50"><span className="px-6 text-center font-serif text-3xl tracking-[0.12em] text-ink/30">LUMA</span><span className="absolute left-3 top-3 rounded-full bg-ivory/90 px-3 py-1 text-xs">En préparation</span></div>
 <div className="mt-4">
 <p className="text-xs uppercase tracking-[0.18em] text-wood">{c.label}</p>
 <h3 className="mt-2 font-serif text-2xl leading-tight">{lumaDraftName(p.title,p.originalCategory,p.supplierProductId)}</h3>
 <p className="mt-3 text-sm text-ink/60">Prix à venir</p>
 <p className="mt-2 text-sm text-ink/50">Photos et détails en cours de validation</p>
 <span className="mt-5 inline-block rounded-full border border-sand px-5 py-3 text-sm">Bientôt disponible</span>
 </div>
 </article>)}</div></section>)}
 </main>;
}