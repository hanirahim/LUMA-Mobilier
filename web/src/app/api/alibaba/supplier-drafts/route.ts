import { NextRequest, NextResponse } from "next/server";
import { randomBytes, timingSafeEqual } from "node:crypto";
import drafts from "@/lib/alibaba/dg-outdoor-listing-drafts.json";
import { readSupplierDrafts, seedSupplierDraftsIfEmpty } from "@/lib/alibaba/firebase-supplier-drafts";
export const runtime="nodejs";export const dynamic="force-dynamic";
const cookie="luma_supplier_import_csrf";
const headers={"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"};
function allowed(r:NextRequest){const uri=process.env.ALIBABA_OAUTH_REDIRECT_URI;try{return process.env.VERCEL_ENV==="preview" && !!uri && new URL(uri).origin===r.nextUrl.origin;}catch{return false;}}
export async function GET(r:NextRequest){
 if(!allowed(r))return NextResponse.json({ok:false},{status:404,headers});
 try{const data=await readSupplierDrafts();const record=data && typeof data==="object"?data as {products?:unknown[]}:null;
 const csrf=randomBytes(32).toString("hex");
 const response=NextResponse.json({ok:true,stored:Array.isArray(record?.products)?record.products.length:0,csrf},{headers});
 response.cookies.set(cookie,csrf,{httpOnly:true,secure:true,sameSite:"strict",path:"/api/alibaba/supplier-drafts",maxAge:300});
 return response;
 }catch{return NextResponse.json({ok:false,status:"firebase_unavailable"},{status:503,headers});}
}
export async function POST(r:NextRequest){
 if(!allowed(r))return NextResponse.json({ok:false},{status:404,headers});
 const given=r.headers.get("x-csrf-token")||"";const expected=r.cookies.get(cookie)?.value||"";
 if(r.headers.get("origin")!==r.nextUrl.origin || r.headers.get("sec-fetch-site")!=="same-origin" || r.headers.get("content-type")?.split(";")[0]!=="application/json" || given.length!==64 || expected.length!==64 || !timingSafeEqual(Buffer.from(given),Buffer.from(expected)))return NextResponse.json({ok:false,status:"denied"},{status:403,headers});
 try{
 const result=await seedSupplierDraftsIfEmpty({...drafts,importedAt:new Date().toISOString(),source:"Alibaba supplier public listing",status:"draft"});
 return NextResponse.json({ok:true,status:result,count:drafts.products.length},{headers});
 }catch{return NextResponse.json({ok:false,status:"firebase_write_failed"},{status:503,headers});}
}
