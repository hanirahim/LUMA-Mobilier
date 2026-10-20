"use client";
import { useState } from "react";
export default function ImportSupplierButton(){
 const [state,setState]=useState<"idle"|"loading"|"success"|"error">("idle");
 async function run(){
 setState("loading");
 try{
 const init=await fetch("/api/alibaba/supplier-drafts",{cache:"no-store"});
 if(!init.ok)throw Error();
 const {csrf}=await init.json() as {csrf:string};
 const r=await fetch("/api/alibaba/supplier-drafts",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json","x-csrf-token":csrf},body:"{}"});
 if(!r.ok)throw Error();
 setState("success");window.location.reload();
 }catch{setState("error");}
 }
 return <div className="my-6"><button type="button" disabled={state==="loading"} onClick={run} className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50">{state==="loading"?"Enregistrement dans Firebase…":"Enregistrer les 20 produits dans Firebase"}</button>{state==="error"&&<p role="alert" className="mt-3 text-red-700">Enregistrement impossible. Vérifiez la configuration Firebase de la version de test.</p>}</div>;
}
