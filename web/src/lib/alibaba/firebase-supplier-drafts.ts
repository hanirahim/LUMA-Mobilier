import "server-only";
import { createPrivateKey, sign } from "node:crypto";
const path = "/supplier_drafts/dg_outdoor";
const lejiangPath = "/supplier_drafts/hebei_lejiang";
function settings() {
 const database = process.env.FIREBASE_DATABASE_URL;
 const email = process.env.FIREBASE_CLIENT_EMAIL;
 const key = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,"\n");
 if (!database || !email || !key) throw new Error("Firebase not configured");
 const url = new URL(database);
 if(url.protocol !== "https:" || !url.hostname.endsWith(".firebasedatabase.app") || url.pathname !== "/" || url.search || url.hash) throw new Error("Invalid Firebase database");
 return {base:url.origin,email,key};
}
async function bearer() {
 const c=settings(); const now=Math.floor(Date.now()/1000);
 const b64=(s:string)=>Buffer.from(s).toString("base64url");
 const payload=b64(JSON.stringify({iss:c.email,sub:c.email,aud:"https://oauth2.googleapis.com/token",scope:"https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",iat:now,exp:now+3600}));
 const unsigned=b64(JSON.stringify({alg:"RS256",typ:"JWT"}))+"."+payload;
 const assertion=unsigned+"."+sign("RSA-SHA256",Buffer.from(unsigned),createPrivateKey(c.key)).toString("base64url");
 const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion}),cache:"no-store",signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new Error("Firebase auth failed");
 const json=await r.json() as {access_token?:string};
 if(!json.access_token)throw new Error("Firebase token missing");
 return json.access_token;
}
export async function readSupplierDrafts():Promise<unknown> {
 const c=settings();const token=await bearer();
 const r=await fetch(c.base+path+".json",{headers:{Authorization:"Bearer "+token},cache:"no-store",signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new Error("Firebase read failed");
 return r.json();
}
export async function seedSupplierDraftsIfEmpty(data:unknown):Promise<"created"|"already_exists"> {
 const c=settings();const token=await bearer();
 const url=c.base+path+".json";
 const r=await fetch(url,{method:"PUT",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json","If-Match":"null_etag"},body:JSON.stringify(data),cache:"no-store",signal:AbortSignal.timeout(15000)});
 if(r.status===412)return "already_exists";
 if(!r.ok)throw new Error("Firebase write failed");
 return "created";
}

export async function readLejiangDrafts():Promise<unknown> {
 const c=settings();const token=await bearer();
 const r=await fetch(c.base+lejiangPath+".json",{headers:{Authorization:"Bearer "+token},cache:"no-store",signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new Error("Firebase read failed");
 return r.json();
}
export async function seedLejiangDraftsIfEmpty(data:unknown):Promise<"created"|"already_exists"> {
 const c=settings();const token=await bearer();
 const r=await fetch(c.base+lejiangPath+".json",{method:"PUT",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json","If-Match":"null_etag"},body:JSON.stringify(data),cache:"no-store",signal:AbortSignal.timeout(15000)});
 if(r.status===412)return "already_exists";
 if(!r.ok)throw new Error("Firebase write failed");
 return "created";
}
