import fs from "fs";

const report = JSON.parse(fs.readFileSync("data/alibaba-fiches.json", "utf8"));
const clean = (value) => String(value || "").replace(/&#39;/g, "'").replace(/&amp;/g, "&");

const db = JSON.parse(fs.readFileSync("data/db.json", "utf8"));
for (const item of report) {
  if (!item.details) continue;
  const product = db.products.find((entry) => entry.slug === item.slug);
  if (!product) continue;
  product.details = clean(item.details);
  const subject = product.details.replace(/^Fiche publiée : /, "").split(". ")[0];
  if (subject) product.description = subject.endsWith(".") ? subject : `${subject}.`;
}
fs.writeFileSync("data/db.json", JSON.stringify(db, null, 2));

function patch(file, imagesOf) {
  let text = fs.readFileSync(file, "utf8");
  for (const item of report) {
    if (!item.local?.length) continue;
    const marker = `id: "${item.slug}"`;
    const start = text.indexOf(marker);
    if (start < 0) {
      console.log("missing", file, item.slug);
      continue;
    }
    const next = text.indexOf("\n    {", start + marker.length);
    const end = next < 0 ? text.length : next;
    let block = text.slice(start, end);
    const details = clean(item.details);
    const subject = details.replace(/^Fiche publiée : /, "").split(". ")[0];
    const description = JSON.stringify(subject.endsWith(".") ? subject : `${subject}.`);
    block = block.replace(/description: "[^"]*",/, `description: ${description},`);
    block = block.replace(/details:\s*\n\s*"[^"]*",/, `details:\n        ${JSON.stringify(details)},`);
    block = block.replace(/images: \[[^\]]+\],/, `images: ${JSON.stringify(imagesOf(item))},`);
    text = text.slice(0, start) + block + text.slice(end);
  }
  fs.writeFileSync(file, text);
}

patch("src/lib/seed.ts", (item) => item.local);
patch("../mobile/lib/seed.ts", (item) => item.remote);
console.log("seeds patched");
