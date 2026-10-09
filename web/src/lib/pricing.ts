import type { Product } from "./types";

export const SHIPPING_PURCHASE = 49;
export const FREE_SHIPPING_FROM = 800;
export const SHIPPING_RENTAL = 79;

export const COST_FEES_RATE = 0.1;
export const COST_MARGIN_RATE = 1;
export const COST_VAT_RATE = 0.2;

export function retailFromCost(purchase: number, transport: number) {
  const landed = (purchase + transport) * (1 + COST_FEES_RATE);
  const withTax = landed * (1 + COST_MARGIN_RATE) * (1 + COST_VAT_RATE);
  return Math.round(withTax / 10) * 10;
}

export function costBreakdown(purchase: number, transport: number) {
  const fees = Math.round((purchase + transport) * COST_FEES_RATE * 100) / 100;
  const landed = Math.round((purchase + transport + fees) * 100) / 100;
  const margin = Math.round(landed * COST_MARGIN_RATE * 100) / 100;
  return { fees, landed, margin, price: retailFromCost(purchase, transport) };
}

export function rentalDayCount(start: string, end: string) {
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T00:00:00`);
  const diff = Math.round((to.getTime() - from.getTime()) / 86400000);
  if (Number.isNaN(diff) || diff < 0) return 0;
  return diff + 1;
}

export function shippingFor(subtotal: number, method: "atelier" | "express" = "atelier") {
  if (subtotal <= 0) return 0;
  if (method === "express") return subtotal >= FREE_SHIPPING_FROM ? 40 : 89;
  return purchaseShipping(subtotal);
}

export function configuredPrice(base: number, materials: string[], material?: string, finish?: string) {
  let price = base;
  if (material && materials[0] && material !== materials[0]) price += 35;
  if (finish === "Huilée") price += 45;
  if (finish === "Dorée") price += 90;
  return price;
}

export const finishOptions = [
  { name: "Naturelle", delta: 0 },
  { name: "Huilée", delta: 45 },
  { name: "Dorée", delta: 90 },
];

export function purchaseShipping(subtotal: number) {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_FROM) return 0;
  return SHIPPING_PURCHASE;
}

export function discountAmount(subtotal: number, percent: number) {
  if (percent <= 0 || subtotal <= 0) return 0;
  return Math.round(subtotal * (percent / 100));
}

export function maxPurchaseQty(product: Product) {
  if (product.availability === "indisponible") return 0;
  if (product.availability === "sur_commande") return 12;
  return Math.min(12, product.stock);
}

export function canRent(product: Product) {
  return product.availability === "en_stock" && product.stock > 0;
}
