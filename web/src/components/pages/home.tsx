"use client";

import Link from "next/link";
import { useState } from "react";
import { Photo, ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store";
import { Button, Container, Eyebrow } from "@/components/ui";
import { scenes, stories, universes } from "@/lib/world";

const reasons = [
  ["01", "Le confort, sans démonstration", "Des proportions justes, des dossiers qui soutiennent, des plateaux à hauteur de vie."],
  ["02", "Des matières qui se patinent", "Chêne, noyer, lin, velours, pierre. Rien qui brille trop fort, tout ce qui dure."],
  ["03", "Une maison à votre écoute", "Un devis clair, une livraison annoncée, quelqu'un à qui écrire."],
  ["04", "LUMA PRO", "Restaurants, hôtels, bureaux, architectes : les mêmes pièces, pour de plus grands projets."],
];

export function HomePage() {
  const { products, reviews } = useStore();
  const popular = products.filter((product) => product.popular).slice(0, 4);
  const fresh = products.filter((product) => product.isNew).slice(0, 4);
  const published = reviews.filter((review) => review.status === "publie").slice(0, 3);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <>
      <section className="grid min-h-[88vh] lg:grid-cols-2">
        <div className="flex flex-col justify-end px-6 py-16 md:px-12 lg:px-16 lg:py-20">
          <Eyebrow>Maison française</Eyebrow>
          <p className="mt-6 font-serif text-6xl tracking-[0.18em] md:text-7xl">LUMA</p>
          <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] md:text-6xl">Le mobilier qui vous ressemble.</h1>
          <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-ink/70">Des pièces pensées pour créer des espaces beaux, confortables et vivants.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/catalogue">Découvrir la collection</Button>
            <Button href="/catalogue?tri=nouveautes" variant="ghost">Voir les nouveautés</Button>
          </div>
        </div>
        <Photo
          src="https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=2000&q=80"
          alt="Intérieur contemporain avec une table, des chaises et du mobilier LUMA"
          priority
          className="min-h-[52vh] lg:min-h-full"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </section>

      <section className="px-6 py-20 md:px-12">
        <Container>
          <Eyebrow>Collections</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Quatre univers, une même maison.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {universes.map((item) => (
              <Link key={item.id} href={`/collections/${item.id}`} className="group relative block overflow-hidden rounded-[1.6rem]">
                <Photo src={item.image} alt={item.name} className="aspect-[16/10]" sizes="(min-width: 768px) 45vw, 100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
                <div className="absolute bottom-0 p-6 text-ivory">
                  <p className="font-serif text-4xl">{item.name}</p>
                  <p className="mt-2 max-w-sm font-light">{item.line}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Rail title="Produits populaires" href="/catalogue?tri=meilleures-ventes" products={popular} />
      <Rail title="Nouveautés" href="/catalogue?tri=nouveautes" products={fresh} />
      <Rail title="Meilleures ventes" href="/catalogue?tri=meilleures-ventes" products={popular.slice().reverse()} />

      <section className="px-6 py-8 md:px-12">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-4xl">Acheter cette ambiance</h2>
            <Link href="/ambiances" className="text-sm underline-offset-4 hover:underline">Toutes les ambiances</Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {scenes.slice(0, 3).map((scene) => (
              <Link key={scene.slug} href={`/ambiance/${scene.slug}`} className="group">
                <Photo src={scene.image} alt={scene.title} className="aspect-[4/5] rounded-[1.4rem]" sizes="(min-width: 768px) 30vw, 100vw" />
                <p className="mt-4 font-serif text-3xl">{scene.title}</p>
                <p className="mt-1 text-sm font-light text-ink/65">{scene.line}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="px-6 py-16 md:px-12">
        <Container>
          <Eyebrow>La maison</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Pourquoi choisir LUMA ?</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {reasons.map(([index, title, text]) => (
              <article key={index}>
                <p className="text-sm text-wood">{index}</p>
                <h3 className="mt-3 font-serif text-3xl">{title}</h3>
                <p className="mt-3 font-light leading-relaxed text-ink/70">{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sand/40 px-6 py-16 md:px-12">
        <Container>
          <Eyebrow>Ils vivent avec LUMA</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl">Avis clients</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {published.map((review) => (
              <li key={review.id} className="rounded-[1.4rem] bg-ivory p-6">
                <p className="font-serif text-2xl leading-snug">« {review.text} »</p>
                <p className="mt-4 text-sm text-ink/60">{review.author}{review.city ? ` · ${review.city}` : ""}{review.verified ? " · Avis vérifié" : ""}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="grid lg:grid-cols-2">
        <Photo src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80" alt="Salon contemporain" className="min-h-[24rem]" sizes="(min-width: 1024px) 50vw, 100vw" />
        <div className="flex flex-col justify-center px-6 py-16 md:px-14">
          <Eyebrow>Professionnels</Eyebrow>
          <h2 className="mt-3 font-serif text-5xl">LUMA PRO</h2>
          <p className="mt-4 max-w-md font-light text-lg leading-relaxed text-ink/70">Des solutions mobilier pour vos projets professionnels.</p>
          <Button href="/pro" className="mt-8 w-fit">Demander un devis professionnel</Button>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12">
        <Container>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-4xl">L'Univers LUMA</h2>
            <Link href="/univers" className="text-sm underline-offset-4 hover:underline">Lire</Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {stories.map((story) => (
              <article key={story.slug}>
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-wood">{story.theme}</p>
                <h3 className="mt-2 font-serif text-3xl">{story.title}</h3>
                <p className="mt-3 font-light leading-relaxed text-ink/70">{story.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="px-6 pb-20 md:px-12">
        <Container className="rounded-[1.8rem] bg-ink px-8 py-14 text-ivory md:px-14">
          <h2 className="font-serif text-4xl md:text-5xl">Votre intérieur mérite du beau.</h2>
          <p className="mt-4 max-w-lg font-light text-ivory/75">Recevez, de temps en temps, une pièce, une ambiance, une nouvelle.</p>
          <form
            className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            onSubmit={async (event) => {
              event.preventDefault();
              await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              setDone(true);
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Votre e-mail"
              className="h-12 flex-1 rounded-full bg-ivory px-5 text-sm text-ink outline-none"
            />
            <button type="submit" className="h-12 rounded-full bg-gold px-6 text-sm text-ink">S'inscrire</button>
          </form>
          {done ? <p className="mt-4 text-sm">C'est noté. Bienvenue.</p> : null}
        </Container>
      </section>
    </>
  );
}

function Rail({ title, href, products }: { title: string; href: string; products: { id: string; slug: string }[] }) {
  const { products: all } = useStore();
  return (
    <section className="px-6 py-8 md:px-12">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-4xl">{title}</h2>
          <Link href={href} className="text-sm underline-offset-4 hover:underline">Tout voir</Link>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((item) => {
            const product = all.find((entry) => entry.id === item.id);
            return product ? <ProductCard key={product.id} product={product} /> : null;
          })}
        </div>
      </Container>
    </section>
  );
}
