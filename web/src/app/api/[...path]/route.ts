import { NextRequest, NextResponse } from "next/server";
import { accountFor, deriveClients, placePurchase, placeQuote, placeReview, saveContact, saveProduct, savePromotion } from "@/lib/commerce";
import { getAlibabaProduct, alibabaStatus } from "@/lib/alibaba";
import { publicCatalog, readDb, updateDb } from "@/lib/db";
import { createSeed } from "@/lib/seed";
import type { CategoryId, OrderStatus, Product, QuoteStatus, RentalStatus, ReservationStatus, ReviewStatus } from "@/lib/types";

const ADMIN_KEY = process.env.LUMA_ADMIN_KEY || "luma-atelier";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-luma-admin",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers });
}

function isAdmin(request: NextRequest) {
  return request.headers.get("x-luma-admin") === ADMIN_KEY;
}

async function body(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function guardAdmin(request: NextRequest) {
  if (!isAdmin(request)) {
    throw new Error("Accès atelier requis.");
  }
}

const orderStatuses: OrderStatus[] = ["confirmee", "en_preparation", "expediee", "en_livraison", "livree", "annulee"];
const rentalStatuses: RentalStatus[] = ["confirmee", "en_cours", "terminee", "annulee"];
const reservationStatuses: ReservationStatus[] = ["demandee", "confirmee", "annulee"];
const quoteStatuses: QuoteStatus[] = ["nouveau", "en_cours", "envoye", "accepte", "refuse"];
const reviewStatuses: ReviewStatus[] = ["publie", "en_attente", "masque"];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params;
  const key = path.join("/");
  try {
    if (key === "catalog") return json(publicCatalog(readDb()));
    if (key === "account") {
      const email = request.nextUrl.searchParams.get("email") ?? "";
      if (!email.includes("@")) return json({ orders: [], rentals: [], reservations: [], quotes: [] });
      return json(accountFor(readDb(), email));
    }
    if (key === "admin") {
      guardAdmin(request);
      const db = readDb();
      return json({ ...db, clients: deriveClients(db) });
    }
    if (key === "admin/alibaba") {
      guardAdmin(request);
      return json(alibabaStatus());
    }
    return json({ error: "Introuvable." }, 404);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params;
  const key = path.join("/");
  const input = await body(request);
  try {
    if (key === "admin/login") {
      return json({ ok: input.password === ADMIN_KEY });
    }
    if (key === "admin/alibaba") {
      guardAdmin(request);
      const product = await getAlibabaProduct(String(input.productId ?? ""));
      return json(product);
    }
    if (key === "orders") {
      const forbidden = ["cardNumber", "number", "pan", "cvc", "cvv", "expiry", "card"];
      if (forbidden.some((field) => field in input)) {
        return json({ error: "LUMA n'accepte pas le numéro complet de la carte." }, 400);
      }
      const order = await updateDb((db) => placePurchase(db, input));
      return json(order, 201);
    }
    if (key === "rentals" || key === "reservations") {
      return json({ error: "LUMA vend uniquement du mobilier neuf." }, 400);
    }
    if (key === "newsletter") {
      const email = String(input.email ?? "").trim().toLowerCase();
      if (!email.includes("@")) return json({ error: "Indiquez un e-mail." }, 400);
      await updateDb((db) => {
        db.newsletter ??= [];
        if (!db.newsletter.includes(email)) db.newsletter.push(email);
        return db.newsletter.length;
      });
      return json({ ok: true }, 201);
    }
    if (key === "quotes") {
      const quote = await updateDb((db) => placeQuote(db, input));
      return json(quote, 201);
    }
    if (key === "contact") {
      const message = await updateDb((db) => saveContact(db, input));
      return json(message, 201);
    }
    if (key === "reviews") {
      const review = await updateDb((db) => placeReview(db, input));
      return json(review, 201);
    }
    if (key === "admin/products") {
      guardAdmin(request);
      const product = await updateDb((db) => saveProduct(db, input as Product));
      return json(product, 201);
    }
    if (key === "admin/promotions") {
      guardAdmin(request);
      const promotion = await updateDb((db) => savePromotion(db, input));
      return json(promotion, 201);
    }
    if (key === "admin/reset") {
      guardAdmin(request);
      const fresh = createSeed();
      const db = await updateDb((current) => {
        current.products = fresh.products;
        current.categories = fresh.categories;
        current.reviews = fresh.reviews;
        current.promotions = fresh.promotions;
        current.orders = fresh.orders;
        current.rentals = fresh.rentals;
        current.reservations = fresh.reservations;
        current.quotes = fresh.quotes;
        return current;
      });
      return json(db);
    }
    return json({ error: "Introuvable." }, 404);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params;
  const input = await body(request);
  try {
    guardAdmin(request);
    if (path[0] !== "admin" || path.length < 3) return json({ error: "Introuvable." }, 404);
    const [, resource, id] = path;
    const updated = await updateDb((db) => {
      if (resource === "products") {
        const current = db.products.find((product) => product.id === id);
        if (!current) throw new Error("Pièce introuvable.");
        return saveProduct(db, { ...current, ...input, id } as Product, id);
      }
      if (resource === "categories") {
        const category = db.categories.find((item) => item.id === (id as CategoryId));
        if (!category) throw new Error("Catégorie introuvable.");
        if (typeof input.tagline === "string") category.tagline = input.tagline.slice(0, 140);
        if (typeof input.description === "string") category.description = input.description.slice(0, 400);
        if (typeof input.image === "string" && input.image.startsWith("http")) category.image = input.image.slice(0, 400);
        return category;
      }
      if (resource === "orders") return setStatus(db.orders, id, input.status, orderStatuses);
      if (resource === "rentals") return setStatus(db.rentals, id, input.status, rentalStatuses);
      if (resource === "reservations") return setStatus(db.reservations, id, input.status, reservationStatuses);
      if (resource === "quotes") return setStatus(db.quotes, id, input.status, quoteStatuses);
      if (resource === "reviews") return setStatus(db.reviews, id, input.status, reviewStatuses);
      if (resource === "promotions") return savePromotion(db, input, id);
      throw new Error("Introuvable.");
    });
    return json(updated);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params;
  try {
    guardAdmin(request);
    if (path[0] !== "admin" || path.length < 3) return json({ error: "Introuvable." }, 404);
    const [, resource, id] = path;
    await updateDb((db) => {
      if (resource === "products") {
        const before = db.products.length;
        db.products = db.products.filter((product) => product.id !== id);
        if (db.products.length === before) throw new Error("Pièce introuvable.");
        return;
      }
      if (resource === "reviews") {
        db.reviews = db.reviews.filter((review) => review.id !== id);
        return;
      }
      if (resource === "promotions") {
        db.promotions = db.promotions.filter((promotion) => promotion.id !== id);
        return;
      }
      throw new Error("Introuvable.");
    });
    return json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}

function setStatus<T extends { id: string; status: string }>(
  list: T[],
  id: string,
  status: string,
  allowed: string[],
) {
  const item = list.find((entry) => entry.id === id);
  if (!item) throw new Error("Introuvable.");
  if (!allowed.includes(status)) throw new Error("Statut inconnu.");
  item.status = status;
  return item;
}

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur est survenue.";
  const status = message === "Accès atelier requis." ? 401 : message === "Introuvable." ? 404 : 400;
  return json({ error: message }, status);
}
