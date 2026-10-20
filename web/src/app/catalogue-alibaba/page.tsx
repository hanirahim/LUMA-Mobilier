import { readSupplierDrafts } from "@/lib/alibaba/firebase-supplier-drafts";
import ImportSupplierButton from "./import-button";
import Image from "next/image";
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
 <h1 className="mt-3 text-4xl font-semibold">Mobilier de jardin — catalogue fournisseur</h1>
 <p className="mt-5 text-stone-600">{drafts.products.length} produits DG OUTDOOR / Express Garden en brouillon. Prix fournisseurs indicatifs en USD, sans transport, taxes ou marge. Aucun achat possible.</p>
 {products.length===0 && <><p className="mt-5 text-sm">Les articles ne sont pas encore enregistrés dans Firebase. Utilisez le bouton pour importer les brouillons.</p><ImportSupplierButton />{error&&<p className="text-red-700">Firebase est momentanément inaccessible.</p>}</>}
 <p className="mt-4 rounded-lg border p-4 text-sm">Photos et fiches techniques à vérifier. Vente à l’unité non confirmée : minimum fournisseur affiché de 10 pièces.</p>
 <nav className="my-8 flex flex-wrap gap-3">{groups.map(c => <a className="rounded-full border px-4 py-2 text-sm" href={`#${c.slug}`} key={c.slug}>{c.label}</a>)}</nav>
 {groups.map(c => <section id={c.slug} key={c.slug} className="mb-12"><h2 className="mb-5 text-2xl font-semibold">{c.label}</h2><div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
 {drafts.products.filter(p => p.originalCategory === c.supplier).map(p => <article key={p.supplierProductId} className="group">
 <div className="relative aspect-[3/4] overflow-hidden rounded-[1.4rem] bg-sand"><Image src={`/api/alibaba/supplier-image/${p.supplierProductId}`} alt={p.title} fill unoptimized sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" /><span className="absolute left-3 top-3 rounded-full bg-ivory/90 px-3 py-1 text-xs">Brouillon</span></div>
 <div className="mt-4">
 <p className="text-xs uppercase tracking-[0.18em] text-wood">{c.label}</p>
 <h3 className="mt-2 font-serif text-2xl leading-tight">{p.title}</h3>
 <p className="mt-3 text-sm">{p.supplierPriceRange.min}–{p.supplierPriceRange.max} $ US</p>
 <p className="mt-2 text-sm text-stone-500">Minimum {p.minimumOrderQuantity} pièces · Réf. {p.supplierProductId}</p>
 <a href={p.supplierUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-full border border-sand px-5 py-3 text-sm">Voir la fiche fournisseur ↗</a>
 <span className="ml-2 text-xs text-ink/50">Non disponible à l’achat</span></div>
 </article>)}</div></section>)}
 </main>;
}