import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const db = JSON.parse(fs.readFileSync(new URL("../data/db.json", import.meta.url), "utf8"));

function byId(list) {
  const map = {};
  for (const item of list) map[item.id] = item;
  return map;
}

function lines(list) {
  const map = {};
  list.forEach((item, index) => {
    map[String(index)] = item;
  });
  return map;
}

const products = {};
const sources = {};
for (const product of db.products) {
  const { source, ...published } = product;
  products[product.id] = published;
  if (source) sources[product.id] = source;
}

const offers = {};
const promotions = {};
for (const promotion of db.promotions) {
  promotions[promotion.id] = promotion;
  if (promotion.active) {
    offers[promotion.id] = {
      id: promotion.id,
      label: promotion.label,
      percent: promotion.percent,
    };
  }
}

const orders = {};
for (const order of db.orders) orders[order.id] = { ...order, items: lines(order.items) };

const quotes = {};
for (const quote of db.quotes) quotes[quote.id] = { ...quote, items: lines(quote.items) };

const rentals = {};
for (const rental of db.rentals) rentals[rental.id] = { ...rental, items: lines(rental.items) };

const reservations = byId(db.reservations);
const reviews = byId(db.reviews);
const publishedReviews = {};
for (const review of db.reviews) {
  if (review.status === "publie") publishedReviews[review.id] = review;
}

const seed = {
  catalog: {
    products,
    categories: byId(db.categories),
    reviews: publishedReviews,
    offers,
  },
  atelier: {
    sources,
    promotions,
    orders,
    quotes,
    rentals,
    reservations,
    reviews,
    contacts: {},
    newsletter: {},
  },
};

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../firebase/seed.json");
fs.writeFileSync(out, JSON.stringify(seed, null, 2) + "\n");
console.log(
  `products ${Object.keys(products).length}, offers ${Object.keys(offers).length}, orders ${Object.keys(orders).length}`,
);
