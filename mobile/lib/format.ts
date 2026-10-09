import type {
  Availability,
  CategoryId,
  OrderStatus,
  QuoteStatus,
  RentalStatus,
  ReservationStatus,
  ReviewStatus,
} from "./types";

export function euro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  const value = iso.length <= 10 ? `${iso}T12:00:00` : iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function uid(prefix: string) {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${random.replace(/-/g, "").slice(0, 8)}`;
}

export const availabilityLabel: Record<Availability, string> = {
  en_stock: "En stock",
  sur_commande: "Sur commande",
  indisponible: "Indisponible",
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  confirmee: "Confirmée",
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

export const rentalStatusLabel: Record<RentalStatus, string> = {
  confirmee: "Confirmée",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

export const reservationStatusLabel: Record<ReservationStatus, string> = {
  demandee: "Demandée",
  confirmee: "Confirmée",
  annulee: "Annulée",
};

export const quoteStatusLabel: Record<QuoteStatus, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
};

export const reviewStatusLabel: Record<ReviewStatus, string> = {
  publie: "Publié",
  en_attente: "En attente",
  masque: "Masqué",
};

export const categoryLabel: Record<CategoryId, string> = {
  chaises: "Chaises",
  tables: "Tables",
  tabourets: "Tabourets",
  lits: "Lits",
};

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
