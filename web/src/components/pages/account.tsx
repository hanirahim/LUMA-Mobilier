"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store";
import { Button, Container, Field, Notice } from "@/components/ui";
import {
  euro,
  formatDate,
  formatDateTime,
  orderStatusLabel,
  quoteStatusLabel,
  uid,
} from "@/lib/format";
import type { Address } from "@/lib/types";

const links = [
  { href: "/compte", id: "apercu", label: "Aperçu" },
  { href: "/compte/profil", id: "profil", label: "Profil" },
  { href: "/compte/commandes", id: "commandes", label: "Commandes" },
  { href: "/compte/factures", id: "factures", label: "Factures" },
  { href: "/compte/devis", id: "devis", label: "Devis" },
  { href: "/compte/favoris", id: "favoris", label: "Favoris" },
  { href: "/compte/adresses", id: "adresses", label: "Adresses" },
  { href: "/compte/historique", id: "historique", label: "Historique" },
] as const;

export type AccountSection = (typeof links)[number]["id"];

export function AccountPage({ section }: { section: AccountSection }) {
  const store = useStore();
  const name = store.profile.firstName || "vous";

  return (
    <Container className="py-12 md:py-16">
      <p className="text-[0.72rem] uppercase tracking-[0.28em] text-wood">Espace client</p>
      <h1 className="mt-3 font-serif text-5xl">Bonjour {name}.</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav className="flex gap-2 overflow-auto lg:flex-col lg:overflow-visible">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${section === link.id ? "bg-ink text-ivory" : "bg-sand/50"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div>
          {section === "apercu" ? <Overview /> : null}
          {section === "profil" ? <ProfileForm /> : null}
          {section === "commandes" ? <Orders /> : null}
          {section === "factures" ? <Invoices /> : null}
          {section === "devis" ? <Quotes /> : null}
          {section === "favoris" ? <Favorites /> : null}
          {section === "adresses" ? <Addresses /> : null}
          {section === "historique" ? <History /> : null}
        </div>
      </div>
    </Container>
  );
}

function Overview() {
  const { account, accountReady, favorites, profile, addresses } = useStore();
  const cards = [
    ["Commandes", account.orders.length, "/compte/commandes"],
    ["Factures", account.orders.length, "/compte/factures"],
    ["Devis", account.quotes.length, "/compte/devis"],
    ["Favoris", favorites.length, "/compte/favoris"],
    ["Adresses", addresses.length, "/compte/adresses"],
  ] as const;
  return (
    <div>
      {!accountReady ? (
        <p className="font-light text-ink/55">Un instant…</p>
      ) : !profile.email ? (
        <Notice>Indiquez votre e-mail dans le profil pour retrouver commandes et devis.</Notice>
      ) : (
        <p className="font-light text-ink/70">Tout ce qui vous concerne, au même endroit.</p>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, count, href]) => (
          <Link key={label} href={href} className="rounded-[1.3rem] border border-sand bg-white p-5">
            <p className="text-sm text-ink/50">{label}</p>
            <p className="mt-2 font-serif text-4xl">{count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProfileForm() {
  const { profile, saveProfile } = useStore();
  const [form, setForm] = useState(profile);
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (!synced && (profile.email || profile.firstName)) {
      setForm(profile);
      setSynced(true);
    }
  }, [profile, synced]);
  return (
    <form
      className="grid max-w-xl gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        saveProfile(form);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Prénom" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
        <Field label="Nom" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
        <Field label="E-mail" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <Field label="Téléphone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <Field label="Entreprise (facultatif)" className="sm:col-span-2" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
      </div>
      <Button type="submit" className="mt-2 w-fit">
        Enregistrer
      </Button>
    </form>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="font-serif text-3xl">{text}</p>;
}

function Pending({ children }: { children: React.ReactNode }) {
  const { accountReady, profile } = useStore();
  if (!accountReady) return <p className="font-light text-ink/55">Un instant…</p>;
  if (!profile.email) return <Empty text="Renseignez votre e-mail dans le profil pour retrouver votre espace." />;
  return children;
}

function Orders() {
  const { account } = useStore();
  const flow = ["confirmee", "en_preparation", "expediee", "en_livraison", "livree"] as const;
  return (
    <Pending>
      {account.orders.length === 0 ? (
        <Empty text="Aucune commande pour le moment." />
      ) : (
        <ul className="space-y-4">
          {account.orders.map((order) => (
            <li key={order.id} className="rounded-[1.3rem] border border-sand p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-serif text-2xl">{order.id}</p>
                <p className="text-sm">{orderStatusLabel[order.status]}</p>
              </div>
              <p className="mt-1 text-sm text-ink/55">{formatDateTime(order.createdAt)}</p>
              {order.status === "annulee" ? null : (
                <ol className="mt-4 flex flex-wrap gap-2 text-xs">
                  {flow.map((status) => {
                    const active = flow.indexOf(status) <= flow.indexOf(order.status as (typeof flow)[number]);
                    return (
                      <li key={status} className={`rounded-full px-3 py-1 ${active ? "bg-ink text-ivory" : "bg-sand/60"}`}>
                        {orderStatusLabel[status]}
                      </li>
                    );
                  })}
                </ol>
              )}
              <p className="mt-3 text-sm">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
              <p className="mt-2">{euro(order.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </Pending>
  );
}

function Invoices() {
  const { account } = useStore();
  return (
    <Pending>
      {account.orders.length === 0 ? (
        <Empty text="Aucune facture pour le moment." />
      ) : (
        <ul className="space-y-4">
          {account.orders.map((order) => (
            <li key={order.id} className="rounded-[1.3rem] border border-sand p-5 text-sm">
              <p className="font-serif text-2xl">Facture {order.id}</p>
              <p className="mt-2 text-ink/60">{formatDateTime(order.createdAt)} · {order.paymentLabel || "Paiement sécurisé"}</p>
              <p className="mt-3">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
              <p className="mt-2">Livraison {euro(order.shipping)} · Total {euro(order.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </Pending>
  );
}

function Quotes() {
  const { account } = useStore();
  return (
    <Pending>
      {account.quotes.length === 0 ? (
        <Empty text="Aucun devis pour le moment." />
      ) : (
    <ul className="space-y-4">
      {account.quotes.map((quote) => (
        <li key={quote.id} className="rounded-[1.3rem] border border-sand p-5">
          <div className="flex justify-between gap-3">
            <p className="font-serif text-2xl">{quote.id}</p>
            <p className="text-sm">{quoteStatusLabel[quote.status]}</p>
          </div>
          <p className="mt-2 text-sm">{quote.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
          {quote.desiredDate ? <p className="mt-1 text-sm text-ink/60">Souhaité le {formatDate(quote.desiredDate)}</p> : null}
        </li>
      ))}
    </ul>
      )}
    </Pending>
  );
}

function Favorites() {
  const { favorites, products } = useStore();
  const loved = products.filter((product) => favorites.includes(product.id));
  if (!loved.length) {
    return (
      <div>
        <Empty text="Vos favoris sont encore vides." />
        <Button href="/catalogue" className="mt-6">
          Parcourir le catalogue
        </Button>
      </div>
    );
  }
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {loved.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function Addresses() {
  const { addresses, saveAddress, removeAddress, profile } = useStore();
  const [form, setForm] = useState<Address>({
    id: uid("adr"),
    label: "Maison",
    fullName: `${profile.firstName} ${profile.lastName}`.trim(),
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    country: "France",
    phone: profile.phone,
  });

  return (
    <div className="grid gap-8">
      <ul className="space-y-3">
        {addresses.length === 0 ? <Empty text="Aucune adresse enregistrée." /> : null}
        {addresses.map((address) => (
          <li key={address.id} className="flex items-start justify-between gap-4 rounded-[1.2rem] border border-sand p-4">
            <p className="text-sm">
              <span className="block font-medium">{address.label}</span>
              {address.fullName}
              <br />
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.postalCode} {address.city}
            </p>
            <button type="button" className="text-sm text-ink/50" onClick={() => removeAddress(address.id)}>
              Retirer
            </button>
          </li>
        ))}
      </ul>
      <form
        className="grid max-w-xl gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          saveAddress(form);
          setForm({ ...form, id: uid("adr"), line1: "", line2: "", postalCode: "", city: "" });
        }}
      >
        <h2 className="font-serif text-3xl">Nouvelle adresse</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Libellé" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} />
          <Field label="Nom" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <Field label="Adresse" className="sm:col-span-2" value={form.line1} onChange={(event) => setForm({ ...form, line1: event.target.value })} required />
          <Field label="Code postal" value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })} required />
          <Field label="Ville" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required />
        </div>
        <Button type="submit" className="w-fit">
          Enregistrer l'adresse
        </Button>
      </form>
    </div>
  );
}

function History() {
  const { account } = useStore();
  const events = [
    ...account.orders.map((item) => ({ id: item.id, date: item.createdAt, label: `Commande · ${euro(item.total)}`, status: orderStatusLabel[item.status] })),
    ...account.quotes.map((item) => ({ id: item.id, date: item.createdAt, label: "Demande de devis", status: quoteStatusLabel[item.status] })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Pending>
      {events.length === 0 ? (
        <Empty text="L'historique est encore vide." />
      ) : (
        <ol className="space-y-4 border-l border-sand pl-5">
          {events.map((event) => (
            <li key={event.id}>
              <p className="text-xs uppercase tracking-[0.16em] text-wood">{formatDateTime(event.date)}</p>
              <p className="mt-1 font-serif text-2xl">{event.label}</p>
              <p className="text-sm text-ink/60">{event.status}</p>
            </li>
          ))}
        </ol>
      )}
    </Pending>
  );
}
