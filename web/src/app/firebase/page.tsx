import type { Metadata } from "next";
import Link from "next/link";
import { readSupplierDrafts } from "@/lib/alibaba/firebase-supplier-drafts";
import { DG_OUTDOOR_CATEGORIES } from "@/lib/alibaba/dg-outdoor";
export const dynamic = "force-dynamic";
export const metadata:Metadata={title:"Firebase — LUMA test",robots:{index:false,follow:false}};
type Draft={supplierProductId:string;title:string;originalCategory:string;supplierUrl:string;supplierCurrency?:string;supplierPriceRange?:{min:number;max:number};minimumOrderQuantity?:number;status?:string};
export default async function FirebasePage(){
 if(process.env.VERCEL_ENV!=="preview")return <main className="mx-auto max-w-5xl px-6 py-16"><h1 className="font-serif text-4xl">Page réservée à la version de test</h1></main>;
 let products:Draft[]=[];let connected=false;let supplierPresent=false;
 try{const raw=await readSupplierDrafts();connected=true;if(raw&&typeof raw==="object"&&"products" in raw&&Array.isArray(raw.products)){products=raw.products as Draft[];supplierPresent=true;}}catch{}
 const groups=DG_OUTDOOR_CATEGORIES.map(c=>({...c,count:products.filter(p=>p.originalCategory===c.supplier).length})).filter(c=>c.count>0);
 return <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
 <p className="text-xs uppercase tracking-[0.18em] text-wood">LUMA · Administration de test</p>
 <h1 className="mt-3 font-serif text-5xl">Données Firebase</h1>
 <p className="mt-5 max-w-3xl text-sm text-ink/70">Vue en lecture seule des brouillons fournisseur stockés dans Firebase Realtime Database. Cette page n'affiche ni clés, ni identifiants de connexion, ni jetons, ni données personnelles. Elle ne constitue pas un inventaire complet de la base.</p>
 <div className="mt-8 grid gap-4 sm:grid-cols-3">
 <div className="rounded-2xl border border-sand bg-white p-6"><p className="text-xs uppercase tracking-widest text-ink/60">Connexion Firebase</p><p className="mt-3 font-serif text-2xl">{connected?"Accessible":"Non vérifiée"}</p></div>
 <div className="rounded-2xl border border-sand bg-white p-6"><p className="text-xs uppercase tracking-widest text-ink/60">Brouillons fournisseur</p><p className="mt-3 font-serif text-3xl">{products.length}</p></div>
 <div className="rounded-2xl border border-sand bg-white p-6"><p className="text-xs uppercase tracking-widest text-ink/60">Catégories avec produits</p><p className="mt-3 font-serif text-3xl">{groups.length}</p></div>
 </div>
 <h2 className="mt-12 font-serif text-3xl">Collections enregistrées</h2>
 <div className="mt-5 rounded-2xl border border-sand bg-white p-5"><p className="text-sm font-medium">supplier_drafts / dg_outdoor</p><p className="mt-2 text-sm text-ink/60">{supplierPresent?"Collection trouvée dans Firebase":"Aucune collection lisible à cet emplacement"}</p><div className="mt-5 flex flex-wrap gap-2">{groups.map(c=><span key={c.slug} className="rounded-full border border-sand px-4 py-2 text-xs">{c.label} · {c.count}</span>)}</div></div>
 <h2 className="mt-12 font-serif text-3xl">Produits stockés</h2>
 {products.length===0?<p className="mt-5 text-sm">Aucun produit disponible. <Link href="/catalogue-alibaba" className="underline">Ouvrir le catalogue fournisseur</Link>.</p>:
 <div className="mt-5 overflow-x-auto rounded-2xl border border-sand bg-white"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-sand bg-sand/30"><tr><th className="p-4">Référence</th><th className="p-4">Produit</th><th className="p-4">Catégorie</th><th className="p-4">Prix fournisseur</th><th className="p-4">Statut</th></tr></thead><tbody>{products.map(p=><tr key={p.supplierProductId} className="border-b border-sand/70"><td className="p-4 text-xs">{p.supplierProductId}</td><td className="p-4"><a href={p.supplierUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{p.title}</a></td><td className="p-4">{DG_OUTDOOR_CATEGORIES.find(c=>c.supplier===p.originalCategory)?.label??p.originalCategory}</td><td className="p-4 whitespace-nowrap">{p.supplierPriceRange?`${p.supplierPriceRange.min}–${p.supplierPriceRange.max} ${p.supplierCurrency??"USD"}`:"Non renseigné"}</td><td className="p-4">{p.status==="draft"?"Brouillon":"À vérifier"}</td></tr>)}</tbody></table></div>}
 <p className="mt-8 text-xs text-ink/50">Seules les données produit de la collection fournisseur autorisée sont consultées. Les autres espaces Firebase, notamment les secrets et informations personnelles, sont volontairement exclus.</p>
 </main>;
}