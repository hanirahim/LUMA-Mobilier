"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { useStore } from "@/components/store";
import { Button, Field } from "@/components/ui";
import {
  availabilityLabel,
  categoryLabel,
  euro,
  euroCents,
  formatDate,
  formatDateTime,
  orderStatusLabel,
  quoteStatusLabel,
  reviewStatusLabel,
} from "@/lib/format";
import type { Availability, OrderStatus, QuoteStatus, ReviewStatus } from "@/lib/types";

const nav = [
  ["Tableau de bord", "/admin"],
  ["Produits", "/admin/produits"],
  ["Catégories", "/admin/categories"],
  ["Stocks", "/admin/stocks"],
  ["Commandes", "/admin/commandes"],
  ["Devis", "/admin/devis"],
  ["Clients", "/admin/clients"],
  ["Avis", "/admin/avis"],
  ["Promotions", "/admin/promotions"],
] as const;

export function AdminFrame({ children }: { children: React.ReactNode }) {
  const { admin, adminData, loginAdmin, logoutAdmin, refreshAdmin } = useStore();
  const pathname = usePathname();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (admin) void refreshAdmin();
  }, [admin, refreshAdmin]);

  if (!admin) {
    return (
      <div className="grid min-h-screen place-items-center bg-ivory px-6">
        <form
          className="w-full max-w-sm"
          onSubmit={async (event) => {
            event.preventDefault();
            const ok = await loginAdmin(password);
            setError(ok ? "" : "Ce mot de passe n'ouvre pas l'atelier.");
          }}
        >
          <Logo />
          <h1 className="mt-8 font-serif text-4xl">Espace atelier</h1>
          <p className="mt-3 text-sm font-light text-ink/65">Réservé à la maison LUMA.</p>
          <div className="mt-6">
            <Field label="Accès" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error ? <p className="mt-3 text-sm text-wood">{error}</p> : null}
          <Button type="submit" className="mt-5 w-full">
            Entrer
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b border-sand md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-5 md:block">
          <Logo compact />
          <button type="button" className="text-xs text-ink/50 md:mt-6" onClick={logoutAdmin}>
            Quitter
          </button>
        </div>
        <nav className="flex gap-2 overflow-auto px-4 pb-4 md:flex-col md:px-3">
          {nav.map(([label, href]) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`whitespace-nowrap rounded-full px-3 py-2 text-sm ${active ? "bg-ink text-ivory" : "hover:bg-sand/60"}`}>
                {label}
              </Link>
            );
          })}
          <Link href="/" className="whitespace-nowrap rounded-full px-3 py-2 text-sm text-ink/50">
            Voir le site
          </Link>
        </nav>
      </aside>
      <div className="px-5 py-8 md:px-10">
        {adminData ? children : <p className="font-serif text-3xl">Ouverture de l'atelier…</p>}
      </div>
    </div>
  );
}

export function AdminHome() {
  const { adminData, adminFetch, refreshAdmin, refreshCatalog, toast } = useStore();
  if (!adminData) return null;
  const openQuotes = adminData.quotes.filter((quote) => quote.status === "nouveau" || quote.status === "en_cours").length;
  const low = adminData.products.filter((product) => product.availability === "en_stock" && product.stock <= 2);
  const cards = [
    ["Produits", adminData.products.length],
    ["Commandes", adminData.orders.length],
    ["Devis ouverts", openQuotes],
    ["Clients", adminData.clients.length],
    ["Avis en attente", adminData.reviews.filter((review) => review.status === "en_attente").length],
  ] as const;

  return (
    <div>
      <h1 className="font-serif text-5xl">Tableau de bord</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-[1.2rem] border border-sand bg-white p-5">
            <p className="text-sm text-ink/50">{label}</p>
            <p className="mt-2 font-serif text-4xl">{value}</p>
          </article>
        ))}
      </div>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">Stocks bas</h2>
        {low.length === 0 ? <p className="mt-3 text-sm text-ink/60">Rien à signaler.</p> : (
          <ul className="mt-3 space-y-2 text-sm">
            {low.map((product) => (
              <li key={product.id}>{product.name} · {product.stock}</li>
            ))}
          </ul>
        )}
      </section>
      <Button
        variant="ghost"
        className="mt-10"
        onClick={async () => {
          if (!window.confirm("Revenir aux données de démonstration ?")) return;
          const response = await adminFetch("/api/admin/reset", { method: "POST" });
          if (!response.ok) {
            toast("La réinitialisation n'a pas abouti.");
            return;
          }
          await refreshAdmin();
          await refreshCatalog();
          toast("Les données de démonstration sont de retour.");
        }}
      >
        Réinitialiser la démonstration
      </Button>
    </div>
  );
}

export function AdminProducts() {
  const { adminData, adminFetch, refreshAdmin, refreshCatalog, toast } = useStore();
  const router = useRouter();
  if (!adminData) return null;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-5xl">Produits</h1>
        <Button href="/admin/produits/nouveau">Ajouter une pièce</Button>
      </div>
      <div className="mt-8 overflow-auto">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-ink/45">
            <tr>
              <th className="py-3 font-normal">Pièce</th>
              <th className="font-normal">Catégorie</th>
              <th className="font-normal">Prix</th>
              <th className="font-normal">Prix d'achat</th>
              <th className="font-normal">Stock</th>
              <th className="font-normal">Disponibilité</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {adminData.products.map((product) => (
              <tr key={product.id} className="border-t border-sand">
                <td className="py-3">{product.name}</td>
                <td>{categoryLabel[product.category]}</td>
                <td className="font-medium text-red-700">{euro(product.price)}</td>
                <td className={product.source?.purchase != null || product.source?.wholesale ? "font-medium text-red-700" : "text-ink/35"}>
                  {product.source?.purchase != null ? euroCents(product.source.purchase) : (product.source?.wholesale ?? "—")}
                </td>
                <td>{product.stock}</td>
                <td>{availabilityLabel[product.availability]}</td>
                <td className="space-x-3 text-right">
                  <button type="button" className="underline-offset-4 hover:underline" onClick={() => router.push(`/admin/produits/${product.id}`)}>
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="text-ink/50"
                    onClick={async () => {
                      if (!window.confirm(`Retirer ${product.name} du catalogue ?`)) return;
                      const response = await adminFetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
                      if (!response.ok) {
                        toast("La suppression n'a pas abouti.");
                        return;
                      }
                      await refreshAdmin();
                      await refreshCatalog();
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminCategories() {
  const { adminData, adminFetch, refreshAdmin, refreshCatalog, toast } = useStore();
  const [drafts, setDrafts] = useState(adminData?.categories ?? []);
  useEffect(() => {
    if (adminData) setDrafts(adminData.categories);
  }, [adminData]);
  if (!adminData) return null;
  return (
    <div>
      <h1 className="font-serif text-5xl">Catégories</h1>
      <div className="mt-8 grid gap-6">
        {drafts.map((category) => (
          <form
            key={category.id}
            className="rounded-[1.3rem] border border-sand p-5"
            onSubmit={async (event) => {
              event.preventDefault();
              const response = await adminFetch(`/api/admin/categories/${category.id}`, {
                method: "PATCH",
                body: JSON.stringify(category),
              });
              if (!response.ok) {
                toast("La catégorie n'a pas été enregistrée.");
                return;
              }
              await refreshAdmin();
              await refreshCatalog();
              toast(`${category.name} est à jour.`);
            }}
          >
            <h2 className="font-serif text-3xl">{category.name}</h2>
            <div className="mt-4 grid gap-3">
              <Field
                label="Accroche"
                value={category.tagline}
                onChange={(event) =>
                  setDrafts((current) => current.map((item) => (item.id === category.id ? { ...item, tagline: event.target.value } : item)))
                }
              />
              <Field
                label="Texte"
                value={category.description}
                onChange={(event) =>
                  setDrafts((current) => current.map((item) => (item.id === category.id ? { ...item, description: event.target.value } : item)))
                }
              />
              <Field
                label="Photo"
                value={category.image}
                onChange={(event) =>
                  setDrafts((current) => current.map((item) => (item.id === category.id ? { ...item, image: event.target.value } : item)))
                }
              />
            </div>
            <Button type="submit" className="mt-4">
              Enregistrer
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}

export function AdminStocks() {
  const { adminData, adminFetch, refreshAdmin, refreshCatalog } = useStore();
  if (!adminData) return null;
  async function save(id: string, stock: number, availability: Availability) {
    await adminFetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ stock, availability }),
    });
    await refreshAdmin();
    await refreshCatalog();
  }
  return (
    <div>
      <h1 className="font-serif text-5xl">Stocks et disponibilités</h1>
      <div className="mt-8 overflow-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-ink/45">
            <tr>
              <th className="py-3 font-normal">Pièce</th>
              <th className="font-normal">Prix</th>
              <th className="font-normal">Prix d'achat</th>
              <th className="font-normal">Stock</th>
              <th className="font-normal">Disponibilité</th>
            </tr>
          </thead>
          <tbody>
            {adminData.products.map((product) => (
              <tr key={product.id} className="border-t border-sand">
                <td className="py-3">{product.name}</td>
                <td className="font-medium text-red-700">{euro(product.price)}</td>
                <td className={product.source?.purchase != null || product.source?.wholesale ? "font-medium text-red-700" : "text-ink/35"}>
                  {product.source?.purchase != null ? euroCents(product.source.purchase) : (product.source?.wholesale ?? "—")}
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    defaultValue={product.stock}
                    className="h-10 w-20 rounded-xl border border-sand px-2"
                    onBlur={(event) => save(product.id, Number(event.target.value), product.availability)}
                  />
                </td>
                <td>
                  <select
                    defaultValue={product.availability}
                    className="h-10 rounded-xl border border-sand bg-white px-2"
                    onChange={(event) => save(product.id, product.stock, event.target.value as Availability)}
                  >
                    {Object.entries(availabilityLabel).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusSelect<T extends string>({ value, options, onChange }: { value: T; options: Record<string, string>; onChange: (value: T) => void }) {
  return (
    <select value={value} className="h-10 rounded-xl border border-sand bg-white px-2 text-sm" onChange={(event) => onChange(event.target.value as T)}>
      {Object.entries(options).map(([id, label]) => (
        <option key={id} value={id}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function AdminOrders() {
  const data = useStore().adminData;
  const change = useStatus("orders");
  if (!data) return null;
  return (
    <RecordList title="Commandes">
      {data.orders.map((order) => (
        <article key={order.id} className="rounded-[1.2rem] border border-sand p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-serif text-2xl">{order.customer.firstName} {order.customer.lastName}</p>
              <p className="text-sm text-ink/55">{formatDateTime(order.createdAt)} · <span className="font-medium text-red-700">{euro(order.total)}</span></p>
            </div>
            <StatusSelect<OrderStatus> value={order.status} options={orderStatusLabel} onChange={(status) => change(order.id, status)} />
          </div>
          <p className="mt-3 text-sm">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
          <p className="mt-1 text-sm text-ink/60">{order.delivery.line1}, {order.delivery.postalCode} {order.delivery.city}</p>
        </article>
      ))}
    </RecordList>
  );
}

export function AdminRentals() {
  return (
    <div>
      <h1 className="font-serif text-5xl">Mobilier</h1>
      <p className="mt-4 max-w-lg font-light text-ink/70">LUMA vend uniquement du mobilier neuf.</p>
    </div>
  );
}

export function AdminReservations() {
  return (
    <div>
      <h1 className="font-serif text-5xl">Mobilier</h1>
      <p className="mt-4 max-w-lg font-light text-ink/70">LUMA vend uniquement du mobilier neuf.</p>
    </div>
  );
}

export function AdminQuotes() {
  const data = useStore().adminData;
  const change = useStatus("quotes");
  if (!data) return null;
  return (
    <RecordList title="Devis">
      {data.quotes.map((quote) => (
        <article key={quote.id} className="rounded-[1.2rem] border border-sand p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-serif text-2xl">{quote.firstName} {quote.lastName}</p>
              <p className="text-sm text-ink/55">{quote.email} · {quote.phone}{quote.company ? ` · ${quote.company}` : ""}</p>
            </div>
            <StatusSelect<QuoteStatus> value={quote.status} options={quoteStatusLabel} onChange={(status) => change(quote.id, status)} />
          </div>
          <p className="mt-3 text-sm">{quote.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
          <p className="mt-1 text-sm text-ink/60">{quote.address}{quote.desiredDate ? ` · souhaité le ${formatDate(quote.desiredDate)}` : ""}</p>
          {quote.message ? <p className="mt-2 text-sm font-light">{quote.message}</p> : null}
        </article>
      ))}
    </RecordList>
  );
}

export function AdminClients() {
  const data = useStore().adminData;
  if (!data) return null;
  return (
    <div>
      <h1 className="font-serif text-5xl">Clients</h1>
      <div className="mt-8 overflow-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-ink/45">
            <tr>
              <th className="py-3 font-normal">Nom</th>
              <th className="font-normal">E-mail</th>
              <th className="font-normal">Téléphone</th>
              <th className="font-normal">Commandes</th>
              <th className="font-normal">Devis</th>
            </tr>
          </thead>
          <tbody>
            {data.clients.map((client) => (
              <tr key={client.email} className="border-t border-sand">
                <td className="py-3">{client.firstName} {client.lastName}{client.company ? ` · ${client.company}` : ""}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
                <td>{client.orders}</td>
                <td>{client.quotes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminReviews() {
  const { adminData, adminFetch, refreshAdmin, refreshCatalog } = useStore();
  const change = useStatus("reviews");
  if (!adminData) return null;
  return (
    <RecordList title="Avis">
      {adminData.reviews.map((review) => (
        <article key={review.id} className="rounded-[1.2rem] border border-sand p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-serif text-2xl">{review.author}{review.city ? ` · ${review.city}` : ""} · {review.rating}/5</p>
            <StatusSelect<ReviewStatus> value={review.status} options={reviewStatusLabel} onChange={(status) => change(review.id, status)} />
          </div>
          <p className="mt-3 font-light">{review.text}</p>
          <button
            type="button"
            className="mt-3 text-sm text-ink/50"
            onClick={async () => {
              await adminFetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
              await refreshAdmin();
              await refreshCatalog();
            }}
          >
            Supprimer
          </button>
        </article>
      ))}
    </RecordList>
  );
}

export function AdminPromotions() {
  const { adminData, adminFetch, refreshAdmin, toast } = useStore();
  const [form, setForm] = useState({ code: "", label: "", percent: 10 });
  if (!adminData) return null;
  return (
    <div>
      <h1 className="font-serif text-5xl">Promotions</h1>
      <form
        className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const response = await adminFetch("/api/admin/promotions", { method: "POST", body: JSON.stringify({ ...form, active: true }) });
          const data = await response.json();
          if (!response.ok) {
            toast(data.error || "La promotion n'a pas été créée.");
            return;
          }
          setForm({ code: "", label: "", percent: 10 });
          await refreshAdmin();
        }}
      >
        <Field label="Code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required />
        <Field label="Intitulé" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} required />
        <Field label="Remise %" type="number" min={1} max={80} value={form.percent} onChange={(event) => setForm({ ...form, percent: Number(event.target.value) })} />
        <Button type="submit" className="sm:col-span-3 w-fit">Créer</Button>
      </form>
      <ul className="mt-8 space-y-3">
        {adminData.promotions.map((promotion) => (
          <li key={promotion.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-sand px-4 py-3 text-sm">
            <span>{promotion.code} · {promotion.label} · {promotion.percent} %</span>
            <span className="flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  await adminFetch(`/api/admin/promotions/${promotion.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ ...promotion, active: !promotion.active }),
                  });
                  await refreshAdmin();
                }}
              >
                {promotion.active ? "Désactiver" : "Activer"}
              </button>
              <button
                type="button"
                className="text-ink/50"
                onClick={async () => {
                  await adminFetch(`/api/admin/promotions/${promotion.id}`, { method: "DELETE" });
                  await refreshAdmin();
                }}
              >
                Supprimer
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecordList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-serif text-5xl">{title}</h1>
      <div className="mt-8 space-y-4">{children}</div>
    </div>
  );
}

function useStatus(resource: string) {
  const { adminFetch, refreshAdmin } = useStore();
  return async (id: string, status: string) => {
    await adminFetch(`/api/admin/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await refreshAdmin();
  };
}
