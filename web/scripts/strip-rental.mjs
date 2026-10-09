import fs from "fs";

const path = "src/lib/commerce.ts";
const lines = fs.readFileSync(path, "utf8").split(/\n/);
const start = lines.findIndex((line) => line.startsWith("export function placeRental"));
const end = lines.findIndex((line) => line.startsWith("export function placeQuote"));
const next = [
  "export function placeRental(): never {",
  '  throw new Error("LUMA vend uniquement du mobilier neuf.");',
  "}",
  "",
  "export function placeReservation(): never {",
  '  throw new Error("LUMA vend uniquement du mobilier neuf.");',
  "}",
  "",
];
fs.writeFileSync(path, [...lines.slice(0, start), ...next, ...lines.slice(end)].join("\n"));
console.log(start, end);
