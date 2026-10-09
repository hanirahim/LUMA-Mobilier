"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/store";
import { Button, Field, Select, TextArea } from "@/components/ui";
import { availabilityLabel, categoryLabel, euroCents } from "@/lib/format";
import { COST_MARGIN_RATE, COST_VAT_RATE, costBreakdown } from "@/lib/pricing";
import type { Availability, CategoryId, Product, ProductColor } from "@/lib/types";

const blank = (): Product => ({
  id: "",
  slug: "",
  name: "",
  category: "chaises",
  price: 0,
  rentPerDay: 0,
  description: "",
  details: "",
  dimensions: { largeur: 0, hauteur: 0, profondeur: 0 },
  materials: [],
  colors: [{ name: "Écru", hex: "#F3EDE3" }],
  images: [""],
  availability: "en_stock",
  stock: 1,
  popular: false,
  isNew: true,
});

export function ProductForm({ id }: { id?: string }) {
  const { adminData, products, adminFetch, refreshAdmin, refreshCatalog, toast } = useStore();
  const existing = adminData?.products.find((product) => product.id === id) ?? products.find((product) => product.id === id);
  const router = useRouter();
  const [form, setForm] = useState<Product>(existing ? { ...existing, colors: [...existing.colors], images: [...existing.images] } : blank());
  const [materials, setMaterials] = useState(existing?.materials.join(", ") ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function patch(partial: Partial<Product>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function setColor(index: number, partial: Partial<ProductColor>) {
    patch({ colors: form.colors.map((color, i) => (i === index ? { ...color, ...partial } : color)) });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const payload: Product = {
      ...form,
      materials: materials.split(",").map((item) => item.trim()).filter(Boolean),
      images: form.images.map((image) => image.trim()).filter(Boolean),
      colors: form.colors.filter((color) => color.name.trim()),
    };
    const response = await adminFetch(id ? `/api/admin/products/${id}` : "/api/admin/products", {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.error || "La pièce n'a pas été enregistrée.");
      return;
    }
    await refreshAdmin();
    await refreshCatalog();
    toast(id ? "Pièce mise à jour." : "Pièce ajoutée au catalogue.");
    router.push("/admin/produits");
  }

  return (
    <form onSubmit={save} className="grid max-w-3xl gap-4">
      <h1 className="font-serif text-5xl">{id ? "Modifier la pièce" : "Nouvelle pièce"}</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nom" value={form.name} onChange={(event) => patch({ name: event.target.value })} required />
        <Select label="Catégorie" value={form.category} onChange={(event) => patch({ category: event.target.value as CategoryId })}>
          {Object.entries(categoryLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Field label="Prix (€)" className="[&_input]:font-medium [&_input]:text-red-700" type="number" min={0} value={form.price} onChange={(event) => patch({ price: Number(event.target.value) })} required />
        {form.source?.purchase != null && form.source.transport != null ? (
          <p className="sm:col-span-2 text-sm font-medium text-red-700">
            Prix d'achat {euroCents(form.source.purchase)} · transport {euroCents(form.source.transport)} · frais {euroCents(costBreakdown(form.source.purchase, form.source.transport).fees)} · marge {COST_MARGIN_RATE * 100} % · TVA {COST_VAT_RATE * 100} %
          </p>
        ) : form.source?.wholesale ? (
          <p className="sm:col-span-2 text-sm font-medium text-red-700">Prix d'achat · {form.source.wholesale}</p>
        ) : null}
        <Field label="Stock" type="number" min={0} value={form.stock} onChange={(event) => patch({ stock: Number(event.target.value) })} />
        <Select label="Disponibilité" value={form.availability} onChange={(event) => patch({ availability: event.target.value as Availability })}>
          {Object.entries(availabilityLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <TextArea label="Description" value={form.description} onChange={(event) => patch({ description: event.target.value })} />
      <TextArea label="Texte long" value={form.details} onChange={(event) => patch({ details: event.target.value })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Largeur (cm)" type="number" value={form.dimensions.largeur} onChange={(event) => patch({ dimensions: { ...form.dimensions, largeur: Number(event.target.value) } })} />
        <Field label="Hauteur (cm)" type="number" value={form.dimensions.hauteur} onChange={(event) => patch({ dimensions: { ...form.dimensions, hauteur: Number(event.target.value) } })} />
        <Field label="Profondeur (cm)" type="number" value={form.dimensions.profondeur} onChange={(event) => patch({ dimensions: { ...form.dimensions, profondeur: Number(event.target.value) } })} />
      </div>
      <Field label="Matières, séparées par des virgules" value={materials} onChange={(event) => setMaterials(event.target.value)} />
      <fieldset>
        <legend className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/55">Couleurs</legend>
        <div className="mt-3 space-y-2">
          {form.colors.map((color, index) => (
            <div key={index} className="grid grid-cols-[1fr_8rem_auto] gap-2">
              <input value={color.name} onChange={(event) => setColor(index, { name: event.target.value })} className="h-12 rounded-2xl border border-sand px-4 text-sm" placeholder="Nom" />
              <input value={color.hex} onChange={(event) => setColor(index, { hex: event.target.value })} className="h-12 rounded-2xl border border-sand px-4 text-sm" placeholder="#E7DED1" />
              <button type="button" className="text-sm text-ink/50" onClick={() => patch({ colors: form.colors.filter((_, i) => i !== index) })}>
                Retirer
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="mt-2 text-sm underline" onClick={() => patch({ colors: [...form.colors, { name: "", hex: "#E7DED1" }] })}>
          Ajouter une couleur
        </button>
      </fieldset>
      <fieldset>
        <legend className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/55">Photos</legend>
        <div className="mt-3 space-y-3">
          {form.images.map((image, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[6rem_1fr_auto]">
              {image ? <img src={image} alt="" className="h-16 w-24 rounded-xl object-cover" /> : <div className="h-16 w-24 rounded-xl bg-sand" />}
              <input
                value={image}
                onChange={(event) => patch({ images: form.images.map((item, i) => (i === index ? event.target.value : item)) })}
                className="h-12 rounded-2xl border border-sand px-4 text-sm"
                placeholder="https://"
              />
              <div className="flex gap-2">
                <button type="button" className="text-sm" onClick={() => move(index, -1)} disabled={index === 0}>
                  Monter
                </button>
                <button type="button" className="text-sm text-ink/50" onClick={() => patch({ images: form.images.filter((_, i) => i !== index) })}>
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="mt-2 text-sm underline" onClick={() => patch({ images: [...form.images, ""] })}>
          Ajouter une photo
        </button>
      </fieldset>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={form.popular} onChange={(event) => patch({ popular: event.target.checked })} />
        Produit populaire
      </label>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={form.isNew} onChange={(event) => patch({ isNew: event.target.checked })} />
        Nouvelle collection
      </label>
      {error ? <p className="text-sm text-wood">{error}</p> : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button href="/admin/produits" variant="ghost">
          Annuler
        </Button>
      </div>
    </form>
  );

  function move(index: number, direction: number) {
    const next = [...form.images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    patch({ images: next });
  }
}
