export function lumaDraftName(title:string,category:string,id:string):string {
 const s=title.toLowerCase();
 const material=s.includes("rattan")?" en résine tressée":s.includes("aluminum")||s.includes("aluminium")?" en aluminium":"";
 const n=id.slice(-4);
 if(category==="Garden Sofa")return `Salon de jardin${material} · ${n}`;
 if(category==="Table & Chair")return `Mobilier de repas extérieur${material} · ${n}`;
 if(category==="Sun Lounger & Daybed")return `Transat de jardin${material} · ${n}`;
 if(category==="Parasols")return `Parasol de jardin · ${n}`;
 if(category==="Balcony Set")return `Ensemble de balcon · ${n}`;
 return `Mobilier d’extérieur · ${n}`;
}
