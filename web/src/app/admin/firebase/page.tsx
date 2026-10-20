"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store";
type Draft={supplierProductId:string;title:string;originalCategory:string;supplierUrl:string;supplierCurrency?:string;supplierPriceRange?:{min:number;max:number};minimumOrderQuantity?:number;status?:string;images?:string[];description?:string|null;attributes?:Record<string,string>;variants?:unknown[]};
type Data={connected:boolean;path:string;supplier:string;collectedAt?:string;importedAt?:string;count:number;products:Draft[]};
export default function AdminFirebase(){
 const {admin,adminFetch}=useStore();
 const [data,setData]=useState<Data|null>(null);const [error,setError]=useState("");const [loading,setLoading]=useState(true);const [search,setSearch]=useState("");
 useEffect(()=>{if(!admin)return;let active=true;(async()=>{try{const r=await adminFetch("/api/admin/firebase",{cache:"no-store"});if(!r.ok)throw Error();const d=await r.json() as Data;if(active)setData(d);}catch{if(active)setError("Impossible de lire Firebase. Vérifiez la connexion et les autorisations administrateur.");}finally{if(active)setLoading(false);}})();return()=>{active=false};},[admin,adminFetch]);
 if(!admin)return null;
 const products=data?.products.filter(p=>(p.title+" "+p.supplierProductId+" "+p.originalCategory).toLowerCase().includes(search.toLowerCase()))||[];
 return <main><p className="text-xs uppercase tracking-[0.18em] text-wood">Administration · données de test</p><h1 className="mt-3 font-serif text-5xl">Firebase</h1>
 <p className="mt-4 text-sm text-ink/65">Lecture seule des brouillons Alibaba stockés dans Firebase Realtime Database. Les informations privées, les comptes et les jetons ne sont jamais affichés.</p>
 {loading&&<p className="mt-8">Lecture de Firebase…</p>}
 {error&&<p role="alert" className="mt-8 rounded-xl border border-sand p-5">{error}</p>}
 {data&&<><div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-sand bg-white p-5"><p className="text-sm text-ink/60">Produits fournisseurs enregistrés</p><p className="mt-2 font-serif text-5xl">{data.count}</p></div><div className="rounded-xl border border-sand bg-white p-5"><p className="text-sm text-ink/60">Emplacement Firebase</p><p className="mt-3 break-all text-sm">{data.path}</p><p className="mt-2 text-xs text-ink/50">{data.supplier}</p></div></div>
 <h2 className="mt-10 font-serif text-3xl">Articles enregistrés</h2><input className="mt-5 w-full rounded-full border border-sand bg-white px-5 py-3 text-sm" placeholder="Rechercher un produit, une catégorie ou une référence…" value={search} onChange={e=>setSearch(e.target.value)}/>
 <p className="mt-3 text-xs text-ink/50">{products.length} résultat(s)</p>
 <div className="mt-6 space-y-3">{products.map(p=><details key={p.supplierProductId} className="rounded-xl border border-sand bg-white p-5"><summary className="cursor-pointer"><span className="font-medium">{p.title}</span><span className="mt-2 block text-xs text-ink/60">{p.originalCategory} · {p.supplierProductId} · {p.status||"brouillon"}</span></summary><div className="mt-5 space-y-2 text-sm"><p>Prix fournisseur : {p.supplierPriceRange?`${p.supplierPriceRange.min}–${p.supplierPriceRange.max} ${p.supplierCurrency||"USD"}`:"Non renseigné"}</p><p>Quantité minimale : {p.minimumOrderQuantity??"Non renseignée"}</p><p>Description : {p.description||"À compléter"}</p><p>Images détaillées : {p.images?.length||0}</p><p>Variantes : {p.variants?.length||0}</p><p>Caractéristiques : {Object.keys(p.attributes||{}).length}</p><a href={p.supplierUrl} target="_blank" rel="noopener noreferrer" className="inline-block underline">Voir sur Alibaba ↗</a></div></details>)}</div></>}
 </main>;
}