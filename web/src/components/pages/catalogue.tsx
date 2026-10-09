"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store";
import { Container, Eyebrow, Select } from "@/components/ui";
import { availabilityLabel, categoryLabel } from "@/lib/format";
import { ratingOf } from "@/lib/world";
import type { Availability, CategoryId, Product } from "@/lib/types";

const prices = [
  { id: "", label: "Tous les prix" },
  { id: "0-500", label: "Moins de 500 €" },
  { id: "500-1000", label: "500 à 1 000 €" },
  { id: "1000-2000", label: "1 000 à 2 000 €" },
  { id: "2000+", label: "Plus de 2 000 €" },
];

export function Catalogue() {
  const { products, reviews } = useStore();
  const params = useSearchParams();
  const router = useRouter();

  const q = params.get("q") ?? "";
  const category = params.get("categorie") ?? "";
  const price = params.get("prix") ?? "";
  const color = params.get("couleur") ?? "";
  const material = params.get("matiere") ?? "";
  const availability = params.get("disponibilite") ?? "";
  const dimension = params.get("dimensions") ?? "";
  const novelty = params.get("nouveaute") ?? "";
  const best = params.get("bestseller") ?? "";
  const sort = params.get("tri") ?? "";

  const colors = [...new Set(products.flatMap((product) => product.colors.map((item) => item.name)))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
  const materials = [...new Set(products.flatMap((product) => product.materials))].sort((a, b) => a.localeCompare(b, "fr"));

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    router.replace(query ? `/catalogue?${query}` : "/catalogue", { scroll: false });
  }

  let list = products.filter((product) => matches(product, { q, category, price, color, material, availability, dimension, novelty, best }));
  if (sort === "prix-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "prix-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "nouveautes") list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
  if (sort === "meilleures-ventes") list = [...list].sort((a, b) => Number(b.popular) - Number(a.popular));
  if (sort === "avis") {
    list = [...list].sort((a, b) => ratingOf(reviews.filter((review) => review.productId === b.id)) - ratingOf(reviews.filter((review) => review.productId === a.id)));
  }

  const title = category ? categoryLabel[category as CategoryId] : "Catalogue";

  return (
    <Container className="py-12 md:py-16">
      <Eyebrow>Les collections</Eyebrow>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-5xl md:text-6xl">{title}</h1>
        <p className="text-sm text-ink/60">
          {list.length} pièce{list.length > 1 ? "s" : ""}
        </p>
      </div>
      <p className="mt-4 max-w-xl font-light text-ink/70">
        {category
          ? "Une sélection claire, pour acheter une pièce et l'installer chez vous."
          : "Chaises, tables, tabourets et lits. Cherchez une pièce, une matière, une couleur."}
      </p>

      <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="md:col-span-2 xl:col-span-4">
          <span className="sr-only">Recherche</span>
          <input
            value={q}
            onChange={(event) => setParam("q", event.target.value)}
            placeholder="Rechercher une pièce, une matière…"
            className="h-12 w-full rounded-full border border-sand bg-white px-5 text-sm outline-none focus:border-wood"
          />
        </label>
        <Select label="Catégorie" value={category} onChange={(event) => setParam("categorie", event.target.value)}>
          <option value="">Toutes</option>
          {Object.entries(categoryLabel).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </Select>
        <Select label="Prix" value={price} onChange={(event) => setParam("prix", event.target.value)}>
          {prices.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
        <Select label="Couleur" value={color} onChange={(event) => setParam("couleur", event.target.value)}>
          <option value="">Toutes</option>
          {colors.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select label="Matière" value={material} onChange={(event) => setParam("matiere", event.target.value)}>
          <option value="">Toutes</option>
          {materials.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select
          label="Disponibilité"
          value={availability}
          onChange={(event) => setParam("disponibilite", event.target.value)}
        >
          <option value="">Toutes</option>
          {Object.entries(availabilityLabel).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </Select>
        <Select label="Trier" value={sort} onChange={(event) => setParam("tri", event.target.value)}>
          <option value="">Pertinence</option>
          <option value="nouveautes">Nouveautés</option>
          <option value="meilleures-ventes">Meilleures ventes</option>
          <option value="avis">Avis</option>
          <option value="prix-asc">Prix croissant</option>
          <option value="prix-desc">Prix décroissant</option>
        </Select>
        <Select label="Dimensions" value={dimension} onChange={(event) => setParam("dimensions", event.target.value)}>
          <option value="">Toutes</option>
          <option value="compact">Compactes, moins de 80 cm</option>
          <option value="ample">Amples, 80 cm et plus</option>
        </Select>
        <Select label="Nouveauté" value={novelty} onChange={(event) => setParam("nouveaute", event.target.value)}>
          <option value="">Toutes</option>
          <option value="oui">Nouveautés seulement</option>
        </Select>
        <Select label="Meilleures ventes" value={best} onChange={(event) => setParam("bestseller", event.target.value)}>
          <option value="">Toutes</option>
          <option value="oui">Best-sellers seulement</option>
        </Select>
      </div>

      {list.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-4xl">Aucune pièce ne correspond.</p>
          <button type="button" className="mt-4 text-sm underline" onClick={() => router.replace("/catalogue")}>
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Container>
  );
}

function matches(
  product: Product,
  filters: {
    q: string;
    category: string;
    price: string;
    color: string;
    material: string;
    availability: string;
    dimension: string;
    novelty: string;
    best: string;
  },
) {
  const haystack = `${product.name} ${product.description} ${product.materials.join(" ")} ${product.category}`.toLowerCase();
  if (filters.q && !haystack.includes(filters.q.trim().toLowerCase())) return false;
  if (filters.category && product.category !== filters.category) return false;
  if (filters.color && !product.colors.some((item) => item.name === filters.color)) return false;
  if (filters.material && !product.materials.includes(filters.material)) return false;
  if (filters.availability && product.availability !== (filters.availability as Availability)) return false;
  if (filters.novelty === "oui" && !product.isNew) return false;
  if (filters.best === "oui" && !product.popular) return false;
  const width = product.dimensions.largeur;
  if (filters.dimension === "compact" && width >= 80) return false;
  if (filters.dimension === "ample" && width < 80) return false;
  if (filters.price === "0-500" && product.price >= 500) return false;
  if (filters.price === "500-1000" && (product.price < 500 || product.price >= 1000)) return false;
  if (filters.price === "1000-2000" && (product.price < 1000 || product.price >= 2000)) return false;
  if (filters.price === "2000+" && product.price < 2000) return false;
  return true;
}
