import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { readSupplierDrafts } from "@/lib/alibaba/firebase-supplier-drafts";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const headers={"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"};
 if(process.env.VERCEL_ENV!=="preview")return NextResponse.json({error:"Introuvable"},{status:404,headers});
 // Match the legacy LUMA admin login configuration in /api/[...path].
 const expected=process.env.LUMA_ADMIN_KEY || "luma-atelier";
 const provided=request.headers.get("x-luma-admin")||"";
 if(!expected || !provided || Buffer.byteLength(expected)!==Buffer.byteLength(provided) || !timingSafeEqual(Buffer.from(expected),Buffer.from(provided)))return NextResponse.json({error:"Accès administrateur requis"},{status:403,headers});
 try{
 const raw=await readSupplierDrafts();
 const data=raw && typeof raw==="object"?raw as Record<string,unknown>:{};
 const products=Array.isArray(data.products)?data.products:[];
 const safe=products.filter(p=>p && typeof p==="object").map(p=>{
 const x=p as Record<string,unknown>;
 return {supplierProductId:x.supplierProductId,title:x.title,originalCategory:x.originalCategory,supplierUrl:x.supplierUrl,supplierCurrency:x.supplierCurrency,supplierPriceRange:x.supplierPriceRange,minimumOrderQuantity:x.minimumOrderQuantity,status:x.status,images:Array.isArray(x.images)?x.images:[],description:x.description,attributes:x.attributes,variants:x.variants};
 });
 return NextResponse.json({connected:true,path:"/supplier_drafts/dg_outdoor",supplier:data.supplier||"DG OUTDOOR",collectedAt:data.collectedAt||null,importedAt:data.importedAt||null,products:safe,count:safe.length},{headers});
 }catch{return NextResponse.json({error:"Lecture Firebase indisponible"},{status:503,headers});}
}
