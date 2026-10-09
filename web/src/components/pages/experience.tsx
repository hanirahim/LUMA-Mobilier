"use client";

import { useState } from "react";
import { Photo, ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store";
import { Button, Container, Eyebrow, Field, Select, TextArea } from "@/components/ui";
import { euro } from "@/lib/format";
import { inUniverse, scenes, serviceFaq, stories, styles, stylesOf, universes } from "@/lib/world";
import type { StyleId } from "@/lib/world";

export function CollectionPage({ id }: { id: string }) {
  const universe = universes.find((item) => item.id === id);
  const { products } = useStore();
  if (!universe) {
    return (
      <Container className="py-24">
        <h1 className="font-serif text-5xl">Cette collection n'existe pas.</h1>
        <Button href="/" className="mt-8">Retour</Button>
      </Container>
    );
  }
  const list = products.filter((product) => inUniverse(product, universe.id));
  return (
    <>
      <section className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-end px-6 py-16 md:px-12">
          <Eyebrow>Collection</Eyebrow>
          <h1 className="mt-3 font-serif text-5xl md:text-7xl">{universe.name}</h1>
          <p className="mt-4 max-w-md text-lg font-light leading-relaxed text-ink/70">{universe.line}</p>
        </div>
        <Photo src={universe.image} alt={universe.name} className="min-h-[22rem]" sizes="(min-width: 1024px) 50vw, 100vw" />
      </section>
      <Container className="py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </>
  );
}

export function AmbiancesPage() {
  return (
    <Container className="py-12 md:py-16">
      <Eyebrow>Inspiration</Eyebrow>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl">Acheter cette ambiance</h1>
      <p className="mt-4 max-w-xl font-light text-ink/70">Des pièces déjà composées. Un geste, et elles rejoignent le panier.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {scenes.map((scene) => (
          <a key={scene.slug} href={`/ambiance/${scene.slug}`} className="group">
            <Photo src={scene.image} alt={scene.title} className="aspect-[16/10] rounded-[1.4rem]" sizes="(min-width: 768px) 45vw, 100vw" />
            <h2 className="mt-4 font-serif text-3xl">{scene.title}</h2>
            <p className="mt-1 font-light text-ink/65">{scene.line}</p>
          </a>
        ))}
      </div>
    </Container>
  );
}

export function AmbiancePage({ slug }: { slug: string }) {
  const scene = scenes.find((item) => item.slug === slug);
  const { products, addToCart, toast } = useStore();
  if (!scene) {
    return (
      <Container className="py-24">
        <h1 className="font-serif text-5xl">Cette ambiance n'est plus présentée.</h1>
      </Container>
    );
  }
  const lines = scene.items
    .map((item) => ({ ...item, product: products.find((product) => product.id === item.id) }))
    .filter((item) => item.product);
  const total = lines.reduce((sum, item) => sum + item.product!.price * item.quantity, 0);

  return (
    <Container className="py-12 md:py-16">
      <Photo src={scene.image} alt={scene.title} className="aspect-[16/8] rounded-[1.6rem]" sizes="100vw" />
      <h1 className="mt-8 font-serif text-5xl md:text-6xl">{scene.title}</h1>
      <p className="mt-3 max-w-xl font-light text-lg text-ink/70">{scene.line}</p>
      <ul className="mt-8 space-y-3">
        {lines.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 border-b border-sand pb-3 text-sm">
            <span>{item.product!.name} × {item.quantity}</span>
            <span>{euro(item.product!.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-serif text-3xl">{euro(total)}</p>
      <Button
        className="mt-6"
        onClick={() => {
          lines.forEach((item) => {
            addToCart(
              {
                productId: item.product!.id,
                mode: "achat",
                quantity: item.quantity,
                color: item.product!.colors[0]?.name ?? "",
                material: item.product!.materials[0] ?? "",
                finish: "Naturelle",
              },
              item.product!.name,
            );
          });
          toast("L'ambiance est dans votre panier.");
        }}
      >
        Acheter cette ambiance
      </Button>
    </Container>
  );
}

export function StylePage() {
  const { products } = useStore();
  const [style, setStyle] = useState<StyleId | "">("");
  const list = style ? products.filter((product) => stylesOf(product).includes(style)).slice(0, 8) : [];
  return (
    <Container className="py-12 md:py-16">
      <Eyebrow>Trouvez votre style LUMA</Eyebrow>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl">Quel style aimez-vous ?</h1>
      <div className="mt-8 flex flex-wrap gap-2">
        {styles.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStyle(item.id)}
            className={`rounded-full border px-5 py-2 text-sm ${style === item.id ? "border-ink bg-ink text-ivory" : "border-sand"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {style ? (
        <section className="mt-12">
          <h2 className="font-serif text-4xl">Votre style LUMA</h2>
          <p className="mt-2 font-light text-ink/65">{styles.find((item) => item.id === style)?.label}. Une sélection pour commencer.</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}

const projects = ["Restaurant", "Hôtel", "Café", "Bureau", "Architecte", "Décorateur", "Événement", "Entreprise"];

export function ProPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    projectType: "Restaurant",
    productsText: "",
    quantity: 1,
    budget: "",
    desiredDate: "",
    message: "",
  });
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  return (
    <Container className="py-12 md:py-16">
      <Eyebrow>Professionnels</Eyebrow>
      <h1 className="mt-3 font-serif text-5xl md:text-7xl">LUMA PRO</h1>
      <p className="mt-4 max-w-xl text-lg font-light text-ink/70">Des solutions mobilier pour vos projets professionnels.</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {projects.map((item) => (
          <li key={item} className="rounded-full bg-sand/70 px-3 py-1 text-xs">{item}</li>
        ))}
      </ul>
      {done ? (
        <p className="mt-10 font-serif text-4xl">Demande {done} reçue. L'atelier vous répond.</p>
      ) : (
        <form
          className="mt-10 grid max-w-2xl gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            const response = await fetch("/api/quotes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...form, address: "France", items: [] }),
            });
            const data = await response.json();
            if (!response.ok) {
              setError(data.error || "La demande n'a pas abouti.");
              return;
            }
            setDone(data.id);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
            <Field label="Prénom" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
            <Field label="Entreprise" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} required />
            <Field label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            <Field label="Téléphone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
            <Select label="Type de projet" value={form.projectType} onChange={(event) => setForm({ ...form, projectType: event.target.value })}>
              {projects.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </div>
          <TextArea label="Produits recherchés" value={form.productsText} onChange={(event) => setForm({ ...form, productsText: event.target.value })} required />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Quantité" type="number" min={1} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} />
            <Field label="Budget indicatif" value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} />
            <Field label="Date souhaitée" type="date" value={form.desiredDate} onChange={(event) => setForm({ ...form, desiredDate: event.target.value })} />
          </div>
          <TextArea label="Message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          {error ? <p className="text-sm text-wood">{error}</p> : null}
          <Button type="submit" className="w-fit">Demander un devis professionnel</Button>
        </form>
      )}
    </Container>
  );
}

export function UniversPage() {
  return (
    <Container className="py-12 md:py-16">
      <Eyebrow>Magazine</Eyebrow>
      <h1 className="mt-3 font-serif text-5xl md:text-7xl">L'Univers LUMA</h1>
      <p className="mt-4 max-w-xl font-light text-lg text-ink/70">Décoration, aménagement, tendances, conseils et guides d'achat.</p>
      <div className="mt-12 space-y-16">
        {stories.map((story) => (
          <article key={story.slug} id={story.slug} className="max-w-3xl">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-wood">{story.theme}</p>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl">{story.title}</h2>
            <p className="mt-4 text-lg font-light leading-relaxed text-ink/75">{story.text}</p>
          </article>
        ))}
      </div>
    </Container>
  );
}

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [chat, setChat] = useState("");
  const [chatSent, setChatSent] = useState(false);
  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-serif text-5xl md:text-6xl">Écrire à LUMA</h1>
      <p className="mt-4 max-w-xl font-light text-ink/70">Formulaire, e-mail ou conversation. L'atelier répond.</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <form
          className="grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
            setSent(true);
          }}
        >
          <Field label="Nom" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Field label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <TextArea label="Message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
          <Button type="submit" className="w-fit">Envoyer</Button>
          {sent ? <p className="text-sm">Message reçu. Merci.</p> : null}
        </form>
        <div className="space-y-4 text-sm font-light leading-relaxed">
          <p>E-mail · atelier@luma.exemple.fr</p>
          <p>Téléphone · sur rendez-vous, après votre message.</p>
          <form
            className="rounded-[1.4rem] border border-sand p-5"
            onSubmit={async (event) => {
              event.preventDefault();
              await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Conversation", email: "visiteur@luma.exemple.fr", message: chat }),
              });
              setChatSent(true);
            }}
          >
            <p className="font-serif text-2xl text-ink">Conversation</p>
            <TextArea label="Votre message" className="mt-3" value={chat} onChange={(event) => setChat(event.target.value)} required />
            <Button type="submit" className="mt-3">Écrire</Button>
            {chatSent ? <p className="mt-3">L'atelier a votre mot.</p> : null}
          </form>
        </div>
      </div>
    </Container>
  );
}

export function FaqPage() {
  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-serif text-5xl md:text-6xl">Questions fréquentes</h1>
      <ul className="mt-10 max-w-3xl divide-y divide-sand">
        {serviceFaq.map((item) => (
          <li key={item.q} className="py-5">
            <h2 className="font-serif text-3xl">{item.q}</h2>
            <p className="mt-2 font-light leading-relaxed text-ink/75">{item.a}</p>
          </li>
        ))}
      </ul>
    </Container>
  );
}

export function ServicePage({ kind }: { kind: "livraison" | "retours" | "propos" | "conditions" | "confidentialite" }) {
  const pages = {
    livraison: {
      title: "Livraison",
      text: "France métropolitaine. Livraison atelier en 5 à 10 jours, 49 €, offerte dès 800 €. Express en 2 à 4 jours, 89 €, ou 40 € dès 800 €. Le suivi se lit dans votre compte : confirmée, préparation, expédition, en livraison, livrée.",
    },
    retours: {
      title: "Retours",
      text: "14 jours pour changer d'avis, pièce non utilisée, dans son emballage d'origine. Écrivez à l'atelier : l'enlèvement est organisé. La garantie de structure est de deux ans. Les tissus et les bois se patinent, ce n'est pas un défaut.",
    },
    propos: {
      title: "À propos",
      text: "LUMA est une maison française de mobilier contemporain. Chaises, tables, tabourets et lits, pensés pour rester. Élégants, fonctionnels, accessibles. Le mobilier qui vous ressemble.",
    },
    conditions: {
      title: "Conditions générales",
      text: "Les prix sont indiqués en euros, livraison en sus selon le barème. La commande est ferme après confirmation. Le paiement se fait par carte (seuls les 4 derniers chiffres sont conservés) ou par virement. LUMA vend du mobilier neuf. Aucune location, aucune réservation à la journée.",
    },
    confidentialite: {
      title: "Politique de confidentialité",
      text: "Les données du compte, des commandes et des devis servent à préparer et livrer vos pièces, et à répondre à LUMA PRO. Elles ne sont pas revendues. Vous pouvez écrire pour les consulter ou les effacer.",
    },
  } as const;
  const page = pages[kind];
  return (
    <Container className="max-w-3xl py-16">
      <h1 className="font-serif text-5xl md:text-6xl">{page.title}</h1>
      <p className="mt-6 text-lg font-light leading-relaxed text-ink/75">{page.text}</p>
    </Container>
  );
}
