import fs from "fs";
import path from "path";
import { createSeed } from "./seed";
import type { Database } from "./types";

const file = path.join(process.cwd(), "data", "db.json");

let queue: Promise<unknown> = Promise.resolve();

export function readDb(): Database {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const initial = createSeed();
    fs.writeFileSync(file, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Database;
  parsed.newsletter ??= [];
  parsed.contacts ??= [];
  parsed.rentals ??= [];
  parsed.reservations ??= [];
  return parsed;
}

export function writeDb(db: Database) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2), "utf8");
}

export function updateDb<T>(mutator: (db: Database) => T): Promise<T> {
  const run = queue.then(() => {
    const db = readDb();
    const result = mutator(db);
    writeDb(db);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function resetDb() {
  const fresh = createSeed();
  writeDb(fresh);
  return fresh;
}

export function publicCatalog(db: Database) {
  return {
    products: db.products.map((product) => {
      const published = { ...product };
      delete published.source;
      return published;
    }),
    categories: db.categories,
    reviews: db.reviews.filter((review) => review.status === "publie"),
    promotions: db.promotions.filter((promotion) => promotion.active).map((promotion) => ({
      id: promotion.id,
      label: promotion.label,
      percent: promotion.percent,
    })),
  };
}
