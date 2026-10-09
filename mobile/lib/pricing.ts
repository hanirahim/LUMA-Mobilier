import type { Product } from "./types";

export const SHIPPING_PURCHASE = 49;
export const FREE_SHIPPING_FROM = 800;
export const SHIPPING_RENTAL = 79;

export function rentalDayCount(start: string, end: string) {
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T00:00:00`);
  const diff = Math.round((to.getTime() - from.getTime()) / 86400000);
  if (Number.isNaN(diff) || diff < 0) return 0;
  return diff + 1;
}

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
