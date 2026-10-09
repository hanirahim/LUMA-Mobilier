"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/components/store";
import { Button, Container, Field, Notice, Select, TextArea } from "@/components/ui";
import { uid } from "@/lib/format";

type Line = { key: string; productId: string; quantity: number };

export function QuotePage() {
  const params = useSearchParams();
  const { products, profile, refreshAccount, saveProfile } = useStore();
  const preset = params.get("produit") ?? "";
  const presetProduct = products.find((product) => product.slug === preset || product.id === preset);
  const [lines, setLines] = useState<Line[]>([
    { key: "first", productId: presetProduct?.id ?? products[0]?.id ?? "", quantity: 1 },
  ]);
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    company: profile.company,
    desiredDate: "",
    message: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [pending, setPending] = useState(false);

  const options = useMemo(() => products.map((product) => ({ id: product.id, name: product.name })), [products]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: lines.filter((line) => line.productId).map((line) => ({ productId: line.productId, quantity: line.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Le devis n'a pas pu être envoyé.");
      saveProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        company: form.company,
      });
      await refreshAccount();
      setDone(data.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <Container className="max-w-2xl py-20">
        <h1 className="font-serif text-5xl">Votre demande est entre nos mains.</h1>
        <p className="mt-4 font-light leading-relaxed text-ink/75">
          Référence {done}. Nous revenons vers vous avec une proposition claire, sans surprise.
        </p>
        <div className="mt-6">
          <Notice>Vous la retrouverez dans votre espace, rubrique Devis.</Notice>
        </div>
        <Button href="/compte/devis" className="mt-8">
          Voir mes devis
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-12 md:py-16">
      <p className="text-[0.72rem] uppercase tracking-[0.28em] text-wood">Projet</p>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl">Demander un devis</h1>
      <p className="mt-4 max-w-xl font-light text-ink/70">
        Pour plusieurs pièces, un lieu, un événement. Dites-nous ce que vous imaginez, nous répondons simplement.
      </p>
      <form onSubmit={submit} className="mt-10 grid max-w-3xl gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom" value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} required />
          <Field label="Prénom" value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} required />
          <Field label="E-mail" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
          <Field label="Téléphone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required />
          <Field label="Entreprise (facultatif)" className="sm:col-span-2" value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} />
        </div>
        <div className="mt-4">
          <p className="font-serif text-3xl">Produits souhaités</p>
          <div className="mt-4 space-y-3">
            {lines.map((line) => (
              <div key={line.key} className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
                <Select
                  label="Pièce"
                  value={line.productId}
                  onChange={(event) =>
                    setLines((current) => current.map((item) => (item.key === line.key ? { ...item, productId: event.target.value } : item)))
                  }
                >
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
                <Field
                  label="Quantité"
                  type="number"
                  min={1}
                  max={99}
                  value={line.quantity}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) => (item.key === line.key ? { ...item, quantity: Number(event.target.value) } : item)),
                    )
                  }
                />
                <button
                  type="button"
                  className="self-end pb-3 text-sm text-ink/50"
                  onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 text-sm underline-offset-4 hover:underline"
            onClick={() => setLines((current) => [...current, { key: uid("line"), productId: products[0]?.id ?? "", quantity: 1 }])}
          >
            Ajouter une pièce
          </button>
        </div>
        <Field label="Date souhaitée" type="date" value={form.desiredDate} onChange={(event) => setForm((current) => ({ ...current, desiredDate: event.target.value }))} />
        <TextArea label="Message" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
        <TextArea label="Adresse" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} required />
        {error ? <p className="text-sm text-wood">{error}</p> : null}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Envoi…" : "Envoyer la demande"}
        </Button>
      </form>
    </Container>
  );
}
