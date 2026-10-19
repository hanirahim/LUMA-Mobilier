"use client";

import { useState } from "react";
import { useStore } from "@/components/store";
import { Button, Container, Field, Notice, TextArea } from "@/components/ui";
import { euro, uid } from "@/lib/format";
import { configuredPrice, purchaseShipping, shippingFor } from "@/lib/pricing";
import type { Address, Order, Profile } from "@/lib/types";

const steps = ["Panier", "Informations", "Adresse", "Livraison", "Paiement", "Confirmation"];

function formatCard(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function luhn(digits: string) {
  let sum = 0;
  let alternate = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function cardProblem(holder: string, number: string, expiry: string, cvc: string) {
  if (holder.trim().length < 2) return "Indiquez le nom du titulaire.";
  const digits = number.replace(/\D/g, "");
  const amex = digits.startsWith("34") || digits.startsWith("37");
  if ((amex && digits.length !== 15) || (!amex && digits.length !== 16) || !luhn(digits)) {
    return "Ce numéro de carte n'est pas valide.";
  }
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return "Indiquez l'expiration au format MM/AA.";
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
  if (month < 1 || month > 12 || expired) return "Cette carte est expirée.";
  if ((amex && cvc.length !== 4) || (!amex && cvc.length !== 3)) return "Le cryptogramme n'est pas valide.";
  return "";
}

const emptyAddress = (): Address => ({
  id: uid("adr"),
  label: "Maison",
  fullName: "",
  line1: "",
  line2: "",
  postalCode: "",
  city: "",
  country: "France",
  phone: "",
});

export function CheckoutPage() {
  const { cart, products, profile, addresses, saveProfile, clearCart, refreshCatalog, refreshAccount } = useStore();
  const purchases = cart.filter((line) => line.mode === "achat");
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Profile>(profile);
  const [deliveryId, setDeliveryId] = useState(addresses[0]?.id ?? "new");
  const [delivery, setDelivery] = useState<Address>(addresses[0] ?? { ...emptyAddress(), fullName: `${profile.firstName} ${profile.lastName}`.trim() });
  const [method, setMethod] = useState<"atelier" | "express">("atelier");
  const [note, setNote] = useState("");
  const [promo, setPromo] = useState("");
  const [pay, setPay] = useState<"carte" | "virement">("carte");
  const [holder, setHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const subtotal = purchases.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.productId);
    if (!product) return sum;
    return sum + configuredPrice(product.price, product.materials, line.material, line.finish) * line.quantity;
  }, 0);
  const shipping = purchases.length ? shippingFor(subtotal, method) : 0;

  if (purchases.length === 0 && !done) {
    return (
      <Container className="py-24">
        <h1 className="font-serif text-5xl">Rien à confirmer pour le moment.</h1>
        <Button href="/catalogue" className="mt-8">Découvrir les collections</Button>
      </Container>
    );
  }

  if (done || step === 5) {
    return (
      <Container className="max-w-2xl py-20">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-wood">Confirmation</p>
        <h1 className="mt-3 font-serif text-5xl leading-none">C'est noté.</h1>
        <p className="mt-5 font-light leading-relaxed text-ink/75">
          Merci {customer.firstName}. Votre commande est enregistrée. Le règlement indiqué reste entre vous et l'atelier : le numéro complet de carte n'est pas conservé.
        </p>
        {done ? <Notice>Commande {done.id} · {euro(done.total)} · {done.paymentLabel}</Notice> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/compte/commandes">Suivre la commande</Button>
          <Button href="/" variant="ghost">Retour à l'accueil</Button>
        </div>
      </Container>
    );
  }

  function chosenDelivery() {
    if (deliveryId !== "new") {
      const saved = addresses.find((item) => item.id === deliveryId);
      if (saved) return { ...saved, fullName: saved.fullName || `${customer.firstName} ${customer.lastName}`.trim(), phone: saved.phone || customer.phone };
    }
    return { ...delivery, fullName: delivery.fullName || `${customer.firstName} ${customer.lastName}`.trim(), phone: delivery.phone || customer.phone };
  }

  function paymentLabel() {
    if (pay === "virement") return "Virement";
    const digits = cardNumber.replace(/\D/g, "");
    const brand = digits.startsWith("34") || digits.startsWith("37") ? "American Express" : digits.startsWith("4") ? "Visa" : "Mastercard";
    return `Carte ${brand} ···· ${digits.slice(-4)}`;
  }

  async function confirm() {
    setError("");
    if (pay === "carte") {
      const problem = cardProblem(holder, cardNumber, expiry, cvc);
      if (problem) {
        setError(problem);
        return;
      }
    }
    if (!accept) {
      setError("Merci de confirmer les conditions.");
      return;
    }
    const label = paymentLabel();
    setPending(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          delivery: chosenDelivery(),
          note,
          promoCode: promo,
          shippingMethod: method,
          paymentLabel: label,
          items: purchases.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            color: line.color,
            material: line.material,
            finish: line.finish,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "La commande n'a pas abouti.");
      clearCart(purchases.map((line) => line.lineId));
      saveProfile(customer);
      await refreshCatalog();
      await refreshAccount();
      setCardNumber("");
      setCvc("");
      setExpiry("");
      setDone(data);
      setStep(5);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Container className="py-12 md:py-16">
      <ol className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-ink/45">
        {steps.map((label, index) => (
          <li key={label} className={index === step ? "text-ink" : ""}>{index + 1}. {label}</li>
        ))}
      </ol>
      <h1 className="mt-4 font-serif text-5xl">{steps[step]}</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          {step === 0 ? (
            <div className="space-y-4">
              {purchases.map((line) => {
                const product = products.find((item) => item.id === line.productId);
                if (!product) return null;
                const unit = configuredPrice(product.price, product.materials, line.material, line.finish);
                return (
                  <p key={line.lineId} className="flex justify-between gap-4 border-b border-sand pb-3 text-sm">
                    <span>{product.name} × {line.quantity}</span>
                    <span>{euro(unit * line.quantity)}</span>
                  </p>
                );
              })}
              <Button href="/panier" variant="quiet">Revenir au panier</Button>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Prénom" value={customer.firstName} onChange={(event) => setCustomer((current) => ({ ...current, firstName: event.target.value }))} required />
              <Field label="Nom" value={customer.lastName} onChange={(event) => setCustomer((current) => ({ ...current, lastName: event.target.value }))} required />
              <Field label="E-mail" type="email" value={customer.email} onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))} required />
              <Field label="Téléphone" value={customer.phone} onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))} />
            </div>
          ) : null}
          {step === 2 ? (
            <div className="space-y-3">
              {addresses.map((address) => (
                <label key={address.id} className="flex items-start gap-3 rounded-2xl border border-sand bg-white px-4 py-3 text-sm">
                  <input type="radio" name="delivery" checked={deliveryId === address.id} onChange={() => setDeliveryId(address.id)} />
                  <span>{address.label} · {address.line1}, {address.postalCode} {address.city}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 text-sm">
                <input type="radio" name="delivery" checked={deliveryId === "new"} onChange={() => setDeliveryId("new")} />
                Nouvelle adresse
              </label>
              {deliveryId === "new" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Adresse" className="sm:col-span-2" value={delivery.line1} onChange={(event) => setDelivery((current) => ({ ...current, line1: event.target.value }))} required />
                  <Field label="Complément" className="sm:col-span-2" value={delivery.line2} onChange={(event) => setDelivery((current) => ({ ...current, line2: event.target.value }))} />
                  <Field label="Code postal" value={delivery.postalCode} onChange={(event) => setDelivery((current) => ({ ...current, postalCode: event.target.value }))} required />
                  <Field label="Ville" value={delivery.city} onChange={(event) => setDelivery((current) => ({ ...current, city: event.target.value }))} required />
                </div>
              ) : null}
            </div>
          ) : null}
          {step === 3 ? (
            <div className="space-y-3">
              <label className="flex items-start gap-3 rounded-2xl border border-sand bg-white px-4 py-4 text-sm">
                <input type="radio" checked={method === "atelier"} onChange={() => setMethod("atelier")} />
                <span>Atelier, 5 à 10 jours · {purchaseShipping(subtotal) === 0 ? "offerte" : euro(purchaseShipping(subtotal))}</span>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-sand bg-white px-4 py-4 text-sm">
                <input type="radio" checked={method === "express"} onChange={() => setMethod("express")} />
                <span>Express, 2 à 4 jours · {euro(subtotal >= 800 ? 40 : 89)}</span>
              </label>
              <p className="text-sm font-light text-ink/65">France métropolitaine. Le suivi apparaît dans votre compte dès l'expédition.</p>
              <TextArea label="Un mot pour l'atelier" value={note} onChange={(event) => setNote(event.target.value)} />
              <Field label="Code promo" value={promo} onChange={(event) => setPromo(event.target.value)} />
            </div>
          ) : null}
          {step === 4 ? (
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-sm">
                <input type="radio" checked={pay === "carte"} onChange={() => setPay("carte")} />
                Carte bancaire
              </label>
              {pay === "carte" ? (
                <div className="grid gap-3 rounded-[1.5rem] border border-sand bg-white p-5 sm:grid-cols-2">
                  <Field label="Titulaire" className="sm:col-span-2" autoComplete="cc-name" value={holder} onChange={(event) => setHolder(event.target.value)} />
                  <Field
                    label="Numéro de carte"
                    className="sm:col-span-2"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="•••• •••• •••• ••••"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(formatCard(event.target.value))}
                  />
                  <Field label="Expiration" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" maxLength={5} value={expiry} onChange={(event) => setExpiry(formatExpiry(event.target.value))} />
                  <Field label="Cryptogramme" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={cvc} onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))} />
                </div>
              ) : null}
              <label className="flex items-center gap-3 text-sm">
                <input type="radio" checked={pay === "virement"} onChange={() => setPay("virement")} />
                Virement
              </label>
              {pay === "virement" ? (
                <p className="text-sm font-light leading-relaxed text-ink/65">
                  La commande est enregistrée. L'atelier envoie le RIB à {customer.email || "votre adresse e-mail"}. Le meuble part une fois le virement reçu.
                </p>
              ) : (
                <p className="text-sm font-light leading-relaxed text-ink/65">
                  Seuls les 4 derniers chiffres sont enregistrés. Le numéro complet et le cryptogramme ne quittent pas cette page.
                </p>
              )}
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={accept} onChange={(event) => setAccept(event.target.checked)} />
                <span>J'accepte les conditions de vente, la livraison et le délai indiqués.</span>
              </label>
            </div>
          ) : null}
          {error ? <p className="mt-4 text-sm text-wood">{error}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {step > 0 ? <Button type="button" variant="ghost" onClick={() => setStep((value) => value - 1)}>Retour</Button> : null}
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 1 && (!customer.firstName || !customer.email.includes("@"))) {
                    setError("Indiquez un prénom et un e-mail.");
                    return;
                  }
                  if (step === 2 && deliveryId === "new" && (!delivery.line1 || !delivery.postalCode || !delivery.city)) {
                    setError("Complétez l'adresse.");
                    return;
                  }
                  setError("");
                  setStep((value) => value + 1);
                }}
              >
                Continuer
              </Button>
            ) : (
              <Button type="button" disabled={pending} onClick={() => void confirm()}>{pending ? "Paiement…" : pay === "carte" ? `Payer ${euro(subtotal + shipping)}` : "Confirmer le virement"}</Button>
            )}
          </div>
        </div>
        <aside className="h-fit rounded-[1.5rem] bg-sand/40 p-6">
          <h2 className="font-serif text-3xl">Total</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Pièces</dt><dd>{euro(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Livraison</dt><dd>{shipping === 0 ? "Offerte" : euro(shipping)}</dd></div>
            <div className="flex justify-between border-t border-sand pt-3 font-medium"><dt>À régler</dt><dd>{euro(subtotal + shipping)}</dd></div>
          </dl>
          <p className="mt-4 text-xs font-light leading-relaxed text-ink/60">Délai selon le mode choisi. Un code promo, s'il est reconnu, est appliqué à la confirmation.</p>
        </aside>
      </div>
    </Container>
  );
}
