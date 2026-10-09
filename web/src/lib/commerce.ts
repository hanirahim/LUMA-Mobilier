import type {
  Address,
  Database,
  Order,
  Product,
  Profile,
  Promotion,
  Quote,
  Rental,
  Reservation,
  Review,
} from "./types";
import { configuredPrice, discountAmount, purchaseShipping } from "./pricing";
import { slugify, uid } from "./format";

const text = (value: unknown, max = 2000) =>
  String(value ?? "").trim().slice(0, max);

function money(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return undefined;
  return Math.round(amount * 100) / 100;
}

function asProfile(input: Partial<Profile> | undefined): Profile {
  const profile = {
    firstName: text(input?.firstName, 80),
    lastName: text(input?.lastName, 80),
    email: text(input?.email, 120).toLowerCase(),
    phone: text(input?.phone, 40),
    company: text(input?.company, 120),
  };
  if (!profile.firstName || !profile.lastName) {
    throw new Error("Indiquez votre prénom et votre nom.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    throw new Error("Indiquez une adresse e-mail valide.");
  }
  return profile;
}

function asAddress(input: Partial<Address> | undefined, label: string): Address {
  const address: Address = {
    id: text(input?.id, 40) || uid("adr"),
    label: text(input?.label, 40) || label,
    fullName: text(input?.fullName, 120),
    line1: text(input?.line1, 160),
    line2: text(input?.line2, 160),
    postalCode: text(input?.postalCode, 12),
    city: text(input?.city, 80),
    country: text(input?.country, 80) || "France",
    phone: text(input?.phone, 40),
  };
  if (!address.fullName || !address.line1 || !address.postalCode || !address.city) {
    throw new Error(`L'adresse de ${label} est incomplète.`);
  }
  return address;
}

function findProduct(db: Database, productId: string) {
  const product = db.products.find((item) => item.id === productId);
  if (!product) throw new Error("Une pièce demandée n'est plus au catalogue.");
  return product;
}

function assertColor(product: Product, color: string) {
  if (!product.colors.some((item) => item.name === color)) {
    throw new Error(`Choisissez une couleur pour ${product.name}.`);
  }
}

export function deriveClients(db: Database) {
  const map = new Map<
    string,
    {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      company: string;
      orders: number;
      rentals: number;
      quotes: number;
    }
  >();

  const touch = (
    email: string,
    profile: { firstName: string; lastName: string; phone: string; company?: string },
    kind: "orders" | "rentals" | "quotes",
  ) => {
    const key = email.toLowerCase();
    const current = map.get(key) ?? {
      email: key,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      company: profile.company ?? "",
      orders: 0,
      rentals: 0,
      quotes: 0,
    };
    current[kind] += 1;
    if (profile.phone) current.phone = profile.phone;
    map.set(key, current);
  };

  db.orders.forEach((order) => touch(order.email, order.customer, "orders"));
  db.rentals.forEach((rental) => touch(rental.email, rental.customer, "rentals"));
  db.quotes.forEach((quote) =>
    touch(
      quote.email,
      {
        firstName: quote.firstName,
        lastName: quote.lastName,
        phone: quote.phone,
        company: quote.company,
      },
      "quotes",
    ),
  );

  return [...map.values()].sort((a, b) => a.lastName.localeCompare(b.lastName, "fr"));
}

export function placePurchase(
  db: Database,
  input: {
    customer: Profile;
    delivery: Address;
    note?: string;
    promoCode?: string;
    items: { productId: string; quantity: number; color: string; material?: string; finish?: string }[];
    shippingMethod?: "atelier" | "express";
    paymentLabel?: string;
  },
): Order {
  const customer = asProfile(input.customer);
  const delivery = asAddress(input.delivery, "livraison");
  if (!input.items?.length) throw new Error("Votre sélection est vide.");

  let subtotal = 0;
  const items = input.items.map((line) => {
    const product = findProduct(db, line.productId);
    const quantity = Math.round(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 12) {
      throw new Error("La quantité demandée n'est pas valide.");
    }
    if (product.availability === "indisponible") {
      throw new Error(`${product.name} n'est pas disponible à l'achat.`);
    }
    if (product.availability === "en_stock" && quantity > product.stock) {
      throw new Error(`Il reste ${product.stock} exemplaire(s) de ${product.name}.`);
    }
    const material = text(line.material, 40);
    const finish = text(line.finish, 40) || "Naturelle";
    const unitPrice = configuredPrice(product.price, product.materials, material, finish);
    subtotal += unitPrice * quantity;
    return {
      productId: product.id,
      name: product.name,
      color: text(line.color, 40),
      quantity,
      unitPrice,
      image: product.images[0] ?? "",
    };
  });

  let discount = 0;
  let promoCode: string | undefined;
  const code = text(input.promoCode, 40).toUpperCase();
  if (code) {
    const promo = db.promotions.find((item) => item.active && item.code.toUpperCase() === code);
    if (!promo) throw new Error("Ce code n'est pas reconnu.");
    discount = discountAmount(subtotal, promo.percent);
    promoCode = promo.code;
  }

  items.forEach((line) => {
    const product = findProduct(db, line.productId);
    if (product.availability === "en_stock") {
      product.stock -= line.quantity;
      if (product.stock <= 0) {
        product.stock = 0;
        product.availability = "indisponible";
      }
    }
  });

  const method = input.shippingMethod === "express" ? "express" : "atelier";
  const shipping = method === "express" ? (subtotal >= 800 ? 40 : 89) : purchaseShipping(subtotal);
  const order: Order = {
    id: uid("cmd"),
    createdAt: new Date().toISOString(),
    email: customer.email,
    customer,
    items,
    delivery,
    shipping,
    discount,
    promoCode,
    total: Math.max(0, subtotal - discount + shipping),
    status: "confirmee",
    note: text(input.note, 1000),
    shippingMethod: method === "express" ? "Express, 2 à 4 jours" : "Atelier, 5 à 10 jours",
    paymentLabel: text(input.paymentLabel, 40) || "Paiement sécurisé",
  };
  db.orders.unshift(order);
  return order;
}

export function placeRental(): never {
  throw new Error("LUMA vend uniquement du mobilier neuf.");
}

export function placeReservation(): never {
  throw new Error("LUMA vend uniquement du mobilier neuf.");
}

export function placeQuote(
  db: Database,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    items: { productId: string; quantity: number }[];
    desiredDate: string;
    message: string;
    address: string;
    projectType?: string;
    budget?: string;
    productsText?: string;
    quantity?: number;
  },
): Quote {
  const customer = asProfile({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    company: input.company ?? "",
  });
  if (!customer.phone) throw new Error("Indiquez un numéro de téléphone.");
  const free = text(input.productsText, 400);
  if (!text(input.address, 300)) input.address = "France";
  if (!input.items?.length && !free) throw new Error("Indiquez les pièces recherchées.");

  const items = input.items?.length
    ? input.items.map((line) => {
        const product = findProduct(db, line.productId);
        const quantity = Math.round(Number(line.quantity));
        if (!Number.isFinite(quantity) || quantity < 1 || quantity > 500) {
          throw new Error("La quantité demandée n'est pas valide.");
        }
        return { productId: product.id, name: product.name, quantity };
      })
    : [{ productId: "libre", name: free, quantity: Math.min(500, Math.max(1, Math.round(Number(input.quantity) || 1))) }];

  const quote: Quote = {
    id: uid("dev"),
    createdAt: new Date().toISOString(),
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    company: customer.company,
    items,
    desiredDate: text(input.desiredDate, 20),
    message: text(input.message, 2000),
    address: text(input.address, 300),
    status: "nouveau",
    projectType: text(input.projectType, 80),
    budget: text(input.budget, 80),
  };
  db.quotes.unshift(quote);
  return quote;
}

export function placeReview(
  db: Database,
  input: {
    productId?: string;
    author: string;
    city: string;
    rating: number;
    text: string;
    email?: string;
  },
): Review {
  const author = text(input.author, 80);
  const body = text(input.text, 600);
  const rating = Math.round(Number(input.rating));
  if (!author || body.length < 8) {
    throw new Error("Écrivez quelques mots, et votre prénom.");
  }
  if (rating < 1 || rating > 5) throw new Error("Choisissez une note entre 1 et 5.");
  if (input.productId) findProduct(db, input.productId);
  const review: Review = {
    id: uid("avi"),
    productId: text(input.productId, 80),
    author,
    city: text(input.city, 80),
    rating,
    text: body,
    status: "en_attente",
    createdAt: new Date().toISOString(),
    verified: Boolean(input.email && db.orders.some((order) => order.email.toLowerCase() === text(input.email, 120).toLowerCase())),
  };
  db.reviews.unshift(review);
  return review;
}

export function saveContact(db: Database, input: { name?: string; email?: string; message?: string }) {
  const name = text(input.name, 80);
  const email = text(input.email, 120).toLowerCase();
  const message = text(input.message, 2000);
  if (!name || !email.includes("@") || message.length < 4) {
    throw new Error("Indiquez un nom, un e-mail et un message.");
  }
  db.contacts ??= [];
  const entry = { id: uid("msg"), name, email, message, createdAt: new Date().toISOString() };
  db.contacts.unshift(entry);
  return entry;
}

export function saveProduct(db: Database, input: Product, id?: string) {
  const name = text(input.name, 80);
  if (!name) throw new Error("Le nom de la pièce est requis.");
  const price = Math.round(Number(input.price));
  const rentPerDay = 0;
  if (!Number.isFinite(price) || price < 0) throw new Error("Indiquez un prix.");
  const categories = new Set(db.categories.map((category) => category.id));
  if (!categories.has(input.category)) throw new Error("Choisissez une catégorie.");

  const colors = (input.colors ?? [])
    .map((color) => ({ name: text(color.name, 40), hex: text(color.hex, 20) || "#E7DED1" }))
    .filter((color) => color.name);
  if (!colors.length) throw new Error("Ajoutez au moins une couleur.");

  const images = (input.images ?? []).map((image) => text(image, 400)).filter(Boolean);
  if (!images.length) throw new Error("Ajoutez au moins une photo.");

  const materials = (input.materials ?? []).map((material) => text(material, 40)).filter(Boolean);
  const stock = Math.max(0, Math.round(Number(input.stock) || 0));
  let slug = slugify(text(input.slug, 80) || name);
  const currentId = id || uid("prd");
  if (db.products.some((product) => product.slug === slug && product.id !== currentId)) {
    slug = `${slug}-${currentId.slice(-4)}`;
  }

  const product: Product = {
    id: currentId,
    slug,
    name,
    category: input.category,
    price,
    rentPerDay,
    description: text(input.description, 400),
    details: text(input.details, 1200),
    dimensions: {
      largeur: Math.max(0, Math.round(Number(input.dimensions?.largeur) || 0)),
      hauteur: Math.max(0, Math.round(Number(input.dimensions?.hauteur) || 0)),
      profondeur: Math.max(0, Math.round(Number(input.dimensions?.profondeur) || 0)),
    },
    materials,
    colors,
    images,
    availability: input.availability,
    stock,
    popular: Boolean(input.popular),
    isNew: Boolean(input.isNew),
    ...(input.source?.url
      ? {
          source: {
            marketplace: "Alibaba" as const,
            url: text(input.source.url, 400),
            wholesale: text(input.source.wholesale, 160),
            ...(money(input.source.purchase) !== undefined ? { purchase: money(input.source.purchase) } : {}),
            ...(money(input.source.transport) !== undefined ? { transport: money(input.source.transport) } : {}),
          },
        }
      : {}),
  };

  const index = db.products.findIndex((item) => item.id === currentId);
  if (index >= 0) db.products[index] = product;
  else db.products.unshift(product);
  return product;
}

export function savePromotion(db: Database, input: Partial<Promotion>, id?: string) {
  const code = text(input.code, 24).toUpperCase();
  const label = text(input.label, 80);
  const percent = Math.round(Number(input.percent));
  if (!code || !label) throw new Error("Indiquez un code et un intitulé.");
  if (!Number.isFinite(percent) || percent < 1 || percent > 80) {
    throw new Error("La remise doit être comprise entre 1 et 80 %.");
  }
  const promo: Promotion = {
    id: id || uid("pro"),
    code,
    label,
    percent,
    active: input.active !== false,
  };
  const index = db.promotions.findIndex((item) => item.id === promo.id);
  if (db.promotions.some((item) => item.code === code && item.id !== promo.id)) {
    throw new Error("Ce code existe déjà.");
  }
  if (index >= 0) db.promotions[index] = promo;
  else db.promotions.unshift(promo);
  return promo;
}

export function accountFor(db: Database, email: string) {
  const key = email.trim().toLowerCase();
  return {
    orders: db.orders.filter((order) => order.email === key),
    rentals: db.rentals.filter((rental) => rental.email === key),
    reservations: db.reservations.filter((reservation) => reservation.email === key),
    quotes: db.quotes.filter((quote) => quote.email === key),
  };
}
