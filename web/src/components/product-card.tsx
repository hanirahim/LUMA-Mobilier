"use client";

import Image from "next/image";
import Link from "next/link";
import { availabilityLabel, categoryLabel, euro } from "@/lib/format";
import { ratingOf } from "@/lib/world";
import type { Product } from "@/lib/types";
import { useStore } from "./store";
import { Button } from "./ui";

export function Photo({
  src,
  alt,
  className,
  priority = false,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-sand ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, favorites, toggleFavorite, reviews } = useStore();
  const loved = favorites.includes(product.id);
  const disabled = product.availability === "indisponible";
  const notes = reviews.filter((review) => review.productId === product.id);
  const rating = ratingOf(notes);

  return (
    <article className="group">
      <div className="relative">
        <Link href={`/produit/${product.slug}`} className="block">
          <Photo
            src={product.images[0]}
            alt={product.name}
            className="aspect-[3/4] rounded-[1.4rem]"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        </Link>
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.isNew ? <span className="rounded-full bg-ivory/90 px-3 py-1 text-[0.68rem] uppercase tracking-[0.14em]">Nouveau</span> : null}
          {product.popular ? <span className="rounded-full bg-ink px-3 py-1 text-[0.68rem] uppercase tracking-[0.14em] text-ivory">Best-seller</span> : null}
        </div>
        <button
          type="button"
          aria-label={loved ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={loved}
          onClick={() => toggleFavorite(product.id)}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-ivory/90 text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={loved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
            <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
          </svg>
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-wood">{categoryLabel[product.category]}</p>
          <Link href={`/produit/${product.slug}`} className="mt-1 block font-serif text-[1.7rem] leading-none">
            {product.name}
          </Link>
        </div>
        <p className="pt-5 text-sm">{euro(product.price)}</p>
      </div>
      <p className="mt-2 flex items-center gap-2 text-xs text-ink/60">
        <span className={`h-1.5 w-1.5 rounded-full ${product.availability === "indisponible" ? "bg-ink/30" : "bg-gold"}`} />
        {availabilityLabel[product.availability]}
        {rating > 0 ? <span>· {rating.toLocaleString("fr-FR")} / 5 · {notes.length} avis</span> : null}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button href={`/produit/${product.slug}`} variant="ghost" className="px-3 text-[0.82rem]">
          Voir le produit
        </Button>
        <Button
          className="px-3 text-[0.82rem]"
          disabled={disabled}
          onClick={() =>
            addToCart(
              {
                productId: product.id,
                mode: "achat",
                quantity: 1,
                color: product.colors[0]?.name ?? "",
                material: product.materials[0] ?? "",
                finish: "Naturelle",
              },
              product.name,
            )
          }
        >
          Ajouter au panier
        </Button>
      </div>
    </article>
  );
}
