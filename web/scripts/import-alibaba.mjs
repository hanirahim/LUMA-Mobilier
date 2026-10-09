import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public", "produits");
const dbPath = path.join(root, "data", "db.json");

const pages = [
  ["chaise-velours-or", ["https://www.alibaba.com/product-detail/Modern-Velvet-Dining-Chair-Upholstered-Cushion_1601578079560.html"]],
  ["fauteuil-frene", ["https://www.alibaba.com/product-detail/2025-Minyu-Luxury-High-End-Solid_1601430887232.html"]],
  ["table-ronde-chene", ["https://www.alibaba.co.uk/product-detail/Modern-Industrial-Luxury-Solid-Oak-Wood_1601712144978.html"]],
  ["table-nordique", [
    "https://www.alibaba.com/product-detail/Nordic-Solid-Wood-Round-Dining-Table_1601622248970.html",
    "https://www.alibaba.co.uk/product-detail/Nordic-Solid-Wood-Round-Dining-Table_1601622248970.html",
  ]],
  ["tabouret-comptoir", ["https://www.alibaba.co.uk/product-detail/Boucle-Luxury-Counter-Height-Commercial-Bar_1601769201590.html"]],
  ["tabouret-haut-boucle", [
    "https://www.alibaba.com/product-detail/Carla-Modern-Bar-Stool-with-Plush_1601767429474.html",
    "https://www.alibaba.co.uk/product-detail/Carla-Modern-Bar-Stool-with-Plush_1601767429474.html",
    "https://www.alibaba.fr/product-detail/Carla-Modern-Bar-Stool-with-Plush_1601767429474.html",
  ]],
  ["lit-coffre", ["https://www.alibaba.co.uk/product-detail/Factory-Wholesale-Italian-Design-Adjustable-Storage_1601662533228.html"]],
  ["lit-boucle", ["https://www.alibaba.co.uk/product-detail/Modern-Queen-King-Size-Boucle-Upholstered_10000022134369.html"]],
];

const skip = new Set([
  "mail packing",
  "Keywords",
  "Quality",
  "brand name",
  "model number",
  "folded",
  "type",
  "general use",
  "Emballage postal",
  "Pliable",
  "Nom de marque",
  "Numéro de modèle",
  "Type",
  "Usage général",
  "Mots-clés",
  "Qualité",
]);

const labels = {
  feature: "Qualités",
  material: "Matière",
  Material: "Matière",
  "Main material": "Matière principale",
  "wood style": "Bois",
  Shape: "Forme",
  Color: "Couleur",
  MOQ: "Minimum de commande",
  "Delivery time": "Délai annoncé",
  Warranty: "Garantie annoncée",
  application: "Usage",
  "specific use": "Usage",
  "design style": "Style",
  appearance: "Style",
  "place of origin": "Origine",
  Legs: "Piètement",
  Packing: "Emballage",
  "Product name": "Nom fournisseur",
};

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
};

function parseDetail(html) {
  const key = "window.detailData = ";
  const start = html.indexOf(key);
  if (start < 0) return null;
  const end = html.indexOf(";\n", start);
  if (end < 0) return null;
  return JSON.parse(html.slice(start + key.length, end));
}

function ficheText(product) {
  const attrs = product.productBasicProperties ?? [];
  const lines = [];
  const seen = new Set();
  for (const attr of attrs) {
    const name = String(attr.attrName ?? "").trim();
    const value = String(attr.attrValue ?? "").trim();
    if (!name || !value || skip.has(name)) continue;
    const label = labels[name] ?? name;
    const line = `${label} : ${value}`;
    if (seen.has(line)) continue;
    seen.add(line);
    lines.push(line);
  }
  return [`Fiche publiée : ${product.subject}.`, ...lines].join(" ");
}

function imageKind(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

async function download(url, file) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const kind = imageKind(bytes);
  if (!kind || bytes.length < 8000) throw new Error(`image invalide ${url} (${bytes.length})`);
  const saved = file.replace(/\.\w+$/, `.${kind}`);
  fs.writeFileSync(saved, bytes);
  return saved;
}

const report = [];

for (const [slug, urls] of pages) {
  let data = null;
  let url = urls[0];
  for (const candidate of urls) {
    const response = await fetch(candidate, { headers });
    const html = await response.text();
    const parsed = parseDetail(html);
    if (parsed?.globalData?.product) {
      data = parsed;
      url = candidate;
      break;
    }
  }
  if (!data?.globalData?.product) {
    report.push({ slug, url, error: "page bloquée ou introuvable" });
    continue;
  }
  const product = data.globalData.product;
  const photos = (product.mediaItems ?? [])
    .filter((item) => item.group === "photos" && item.imageUrl?.big)
    .map((item) => item.imageUrl.big);
  const dir = path.join(publicDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  const local = [];
  for (let index = 0; index < photos.length; index += 1) {
    const file = path.join(dir, `${index + 1}.jpg`);
    try {
      const saved = await download(photos[index], file);
      local.push(`/produits/${slug}/${path.basename(saved)}`);
    } catch (error) {
      report.push({ slug, url, error: String(error.message || error), photo: photos[index] });
    }
  }
  report.push({
    slug,
    url,
    subject: product.subject,
    photos: local.length,
    remote: photos,
    local,
    details: ficheText(product),
  });
}

const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
for (const item of report) {
  if (!item.local?.length) continue;
  const product = db.products.find((entry) => entry.slug === item.slug);
  if (!product) continue;
  product.images = item.local;
  product.details = item.details;
}
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
fs.writeFileSync(path.join(root, "data", "alibaba-fiches.json"), JSON.stringify(report, null, 2));
console.log(report.map((item) => `${item.slug}: ${item.error ?? item.photos + " photos"}`).join("\n"));
