"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Photo, ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store";
import { Button, Container, Eyebrow, Field, Stepper, TextArea } from "@/components/ui";
import { availabilityLabel, categoryLabel, euro } from "@/lib/format";
import { configuredPrice, finishOptions } from "@/lib/pricing";
import { ratingOf, serviceFaq } from "@/lib/world";

export function ProductView({ slug }: { slug: string }) {
  const { products, reviews, catalogReady, addToCart, favorites, toggleFavorite, profile, toast } = useStore();
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    if (!catalogReady) return <div className="grid min-h-[50vh] place-items-center font-serif text-2xl tracking-[0.2em]">LUMA</div>;
    return (
      <Container className="py-28 text-center">
        <h1 className="font-serif text-5xl">Cette pièce n'est plus au catalogue.</h1>
        <Button href="/catalogue" className="mt-8">Retour au catalogue</Button>
      </Container>
    );
  }

  return (
    <ProductBody
      key={product.id}
      productId={product.id}
      loved={favorites.includes(product.id)}
      onLove={() => toggleFavorite(product.id)}
      onAdd={addToCart}
      profileEmail={profile.email}
      related={products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3)}
      complements={products.filter((item) => item.category !== product.category).slice(0, 3)}
      reviews={reviews.filter((review) => review.productId === product.id)}
      toast={toast}
    />
  );
}

function ProductBody({
  productId,
  loved,
  onLove,
  onAdd,
  related,
  complements,
  reviews,
  toast,
}: {
  productId: string;
  loved: boolean;
  onLove: () => void;
  onAdd: (item: { productId: string; mode: "achat"; quantity: number; color: string; material?: string; finish?: string }, name: string) => void;
  profileEmail: string;
  related: { id: string }[];
  complements: { id: string }[];
  reviews: { id: string; author: string; city: string; rating: number; text: string; verified?: boolean }[];
  toast: (message: string) => void;
}) {
  const { products } = useStore();
  const router = useRouter();
  const product = products.find((item) => item.id === productId)!;
  const [image, setImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [material, setMaterial] = useState(product.materials[0] ?? "");
  const [finish, setFinish] = useState("Naturelle");
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const price = configuredPrice(product.price, product.materials, material, finish);
  const rating = ratingOf(reviews);
  const active = product.images[image] ?? product.images[0];
  const disabled = product.availability === "indisponible";

  function line() {
    return { productId: product.id, mode: "achat" as const, quantity, color, material, finish };
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    toast("Le lien est copié.");
  }

  return (
    <Container className="py-10 md:py-14">
      <p className="text-sm text-ink/50">
        <Link href="/">Accueil</Link> / <Link href={`/catalogue?categorie=${product.category}`}>{categoryLabel[product.category]}</Link> / {product.name}
      </p>
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <button type="button" className="block w-full text-left" onClick={() => setZoom(true)} aria-label="Agrandir la photo">
            <Photo src={active} alt={product.name} priority className="aspect-[4/5] rounded-[1.6rem]" sizes="(min-width: 1024px) 50vw, 100vw" />
          </button>
          {product.images.length > 1 ? (
            <div className="mt-3 grid grid-cols-6 gap-2">
              {product.images.map((src, index) => (
                <button key={`${index}-${src}`} type="button" onClick={() => setImage(index)} className={`overflow-hidden rounded-2xl ring-1 ${index === image ? "ring-ink" : "ring-transparent"}`} aria-label={`Photo ${index + 1}`}>
                  <Photo src={src} alt="" className="aspect-square" sizes="80px" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="lg:pt-4">
          <div className="flex items-start justify-between gap-4">
            <Eyebrow>{categoryLabel[product.category]}</Eyebrow>
            <button type="button" onClick={onLove} className="text-sm" aria-pressed={loved}>{loved ? "Dans vos favoris" : "Favori"}</button>
          </div>
          <h1 className="mt-3 font-serif text-5xl leading-none md:text-6xl">{product.name}</h1>
          <p className="mt-5 max-w-md text-lg font-light leading-relaxed text-ink/75">{product.description}</p>
          {rating > 0 ? <p className="mt-4 text-sm">{rating.toLocaleString("fr-FR")} / 5 · {reviews.length} avis</p> : null}
          <p className="mt-6 font-serif text-4xl">{euro(price)}</p>
          <p className="mt-2 text-sm text-ink/60">
            {availabilityLabel[product.availability]}
            {product.availability === "en_stock" ? ` · ${product.stock} disponible${product.stock > 1 ? "s" : ""}` : ""}
            {product.availability === "sur_commande" ? " · Fabriquée à la demande, le délai est indiqué au devis." : ""}
          </p>

          <Option label="Couleur" values={product.colors.map((item) => item.name)} value={color} onChange={setColor} />
          <Option label="Matière" values={product.materials} value={material} onChange={setMaterial} />
          <Option label="Finition" values={finishOptions.map((item) => item.name)} value={finish} onChange={setFinish} />
          <p className="mt-3 text-sm font-light text-ink/60">
            {finish === "Naturelle" && material === product.materials[0] ? "Prix de la pièce." : "Le prix suit la matière et la finition."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Stepper value={quantity} max={product.availability === "en_stock" ? Math.max(1, product.stock) : 12} onChange={setQuantity} />
            <p className="text-sm text-ink/50">Quantité</p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button disabled={disabled} onClick={() => onAdd(line(), product.name)}>Ajouter au panier</Button>
            <Button
              variant="ghost"
              disabled={disabled}
              onClick={() => {
                onAdd(line(), product.name);
                router.push("/commander");
              }}
            >
              Acheter maintenant
            </Button>
            <div className="flex flex-wrap gap-4 text-sm">
              <button type="button" className="underline-offset-4 hover:underline" onClick={() => void share()}>Partager</button>
              <Link href="/pro" className="underline-offset-4 hover:underline">Demander un devis professionnel</Link>
            </div>
          </div>

          <dl className="mt-10 space-y-4 border-t border-sand pt-6 text-sm">
            {product.dimensions.largeur || product.dimensions.hauteur || product.dimensions.profondeur ? (
              <div>
                <dt className="text-ink/50">Dimensions</dt>
                <dd className="mt-1">L {product.dimensions.largeur} × H {product.dimensions.hauteur} × P {product.dimensions.profondeur} cm</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-ink/50">Livraison</dt>
              <dd className="mt-1">France métropolitaine. Atelier en 5 à 10 jours, offerte dès 800 €. Express en 2 à 4 jours.</dd>
            </div>
            <div>
              <dt className="text-ink/50">Garantie</dt>
              <dd className="mt-1">Deux ans sur la structure.</dd>
            </div>
            <div>
              <dt className="text-ink/50">Entretien</dt>
              <dd className="mt-1">Chiffon doux, eau claire. Le bois aime une huile, de temps en temps.</dd>
            </div>
          </dl>
          <p className="mt-6 font-light leading-relaxed text-ink/75">{product.details}</p>
        </div>
      </div>

      <section className="mt-16 border-t border-sand pt-10">
        <h2 className="font-serif text-4xl">Questions fréquentes</h2>
        <ul className="mt-6 divide-y divide-sand">
          {serviceFaq.map((item) => (
            <li key={item.q}>
              <button type="button" className="flex w-full items-center justify-between py-4 text-left" onClick={() => setOpenFaq(openFaq === item.q ? null : item.q)}>
                <span>{item.q}</span>
                <span className="text-wood">{openFaq === item.q ? "–" : "+"}</span>
              </button>
              {openFaq === item.q ? <p className="pb-4 font-light text-ink/70">{item.a}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-4xl">Avis</h2>
          <button type="button" className="text-sm underline-offset-4 hover:underline" onClick={() => setReviewOpen((value) => !value)}>Laisser un avis</button>
        </div>
        {rating > 0 ? <p className="mt-3 text-sm text-ink/60">Note {rating.toLocaleString("fr-FR")} / 5 · {reviews.length} avis</p> : null}
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {reviews.length === 0 ? <li className="font-light text-ink/60">Les premiers mots sur cette pièce seront les vôtres.</li> : null}
          {reviews.map((review) => (
            <li key={review.id} className="rounded-[1.3rem] border border-sand p-5">
              <p className="text-sm text-wood">{"●".repeat(review.rating)}</p>
              <p className="mt-3 font-light leading-relaxed">« {review.text} »</p>
              <p className="mt-3 text-sm">{review.author}{review.city ? ` · ${review.city}` : ""}{review.verified ? " · Avis vérifié" : ""}</p>
            </li>
          ))}
        </ul>
        {reviewOpen ? <ReviewForm productId={product.id} onDone={() => setReviewOpen(false)} /> : null}
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-4xl">Vous pourriez aussi aimer</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => {
            const found = products.find((entry) => entry.id === item.id);
            return found ? <ProductCard key={found.id} product={found} /> : null;
          })}
        </div>
      </section>
      <section className="mt-16">
        <h2 className="font-serif text-4xl">Complétez votre intérieur</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {complements.map((item) => {
            const found = products.find((entry) => entry.id === item.id);
            return found ? <ProductCard key={found.id} product={found} /> : null;
          })}
        </div>
      </section>

      {zoom ? (
        <button type="button" className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-6" onClick={() => setZoom(false)} aria-label="Fermer">
          <img src={active} alt={product.name} className="max-h-[90vh] max-w-5xl rounded-[1.4rem] object-contain" />
        </button>
      ) : null}
    </Container>
  );
}

function Option({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (value: string) => void }) {
  if (!values.length) return null;
  return (
    <div className="mt-6">
      <p className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/55">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((item) => (
          <button key={item} type="button" onClick={() => onChange(item)} className={`rounded-full border px-4 py-2 text-sm ${value === item ? "border-ink bg-ink text-ivory" : "border-sand"}`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const { profile, toast, refreshCatalog } = useStore();
  const [form, setForm] = useState({ author: profile.firstName, city: "", rating: 5, text: "" });
  return (
    <form
      className="mt-6 grid max-w-xl gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, productId, email: profile.email }),
        });
        const data = await response.json();
        if (!response.ok) {
          toast(data.error || "L'avis n'a pas pu être envoyé.");
          return;
        }
        toast("Merci. Votre avis sera lu par l'atelier.");
        await refreshCatalog();
        onDone();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Prénom" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} required />
        <Field label="Ville" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
      </div>
      <Field label="Note (1 à 5)" type="number" min={1} max={5} value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} />
      <TextArea label="Votre mot" value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} required />
      <Button type="submit" className="w-fit">Envoyer</Button>
    </form>
  );
}
