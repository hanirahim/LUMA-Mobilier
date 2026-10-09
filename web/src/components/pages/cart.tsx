"use client";

import { Photo, ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store";
import { Button, Container, Stepper } from "@/components/ui";
import { euro } from "@/lib/format";
import { configuredPrice, FREE_SHIPPING_FROM, purchaseShipping } from "@/lib/pricing";

export function CartPage() {
  const { cart, products, updateCart, removeFromCart } = useStore();
  const lines = cart
    .filter((line) => line.mode === "achat")
    .map((line) => ({ line, product: products.find((product) => product.id === line.productId) }))
    .filter((entry) => entry.product);

  const subtotal = lines.reduce((sum, entry) => {
    const price = configuredPrice(entry.product!.price, entry.product!.materials, entry.line.material, entry.line.finish);
    return sum + price * entry.line.quantity;
  }, 0);
  const shipping = lines.length ? purchaseShipping(subtotal) : 0;
  const complements = products.filter((product) => !lines.some((entry) => entry.product!.id === product.id)).slice(0, 3);

  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-serif text-5xl md:text-6xl">Panier</h1>
      {lines.length === 0 ? (
        <div className="py-20">
          <p className="font-serif text-4xl">Votre panier est encore léger.</p>
          <p className="mt-3 font-light text-ink/70">Découvrez l'univers LUMA.</p>
          <Button href="/catalogue" className="mt-8">Continuer mes achats</Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
          <ul className="space-y-6">
            {lines.map(({ line, product }) => {
              const unit = configuredPrice(product!.price, product!.materials, line.material, line.finish);
              return (
                <li key={line.lineId} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-sand pb-6 sm:grid-cols-[8.5rem_1fr_auto]">
                  <Photo src={product!.images[0]} alt="" className="aspect-square rounded-2xl" sizes="140px" />
                  <div>
                    <h2 className="font-serif text-3xl">{product!.name}</h2>
                    <p className="mt-1 text-sm text-ink/60">
                      {[line.color, line.material, line.finish].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <Stepper
                        value={line.quantity}
                        max={product!.availability === "en_stock" ? Math.max(1, product!.stock) : 12}
                        onChange={(quantity) => updateCart(line.lineId, { quantity })}
                      />
                      <button type="button" className="text-sm text-ink/50 underline-offset-4 hover:underline" onClick={() => removeFromCart(line.lineId)}>
                        Retirer
                      </button>
                    </div>
                  </div>
                  <p className="col-span-2 text-sm sm:col-span-1 sm:pt-8 sm:text-right">{euro(unit * line.quantity)}</p>
                </li>
              );
            })}
          </ul>
          <aside className="h-fit rounded-[1.5rem] bg-sand/40 p-6">
            <h2 className="font-serif text-3xl">Récapitulatif</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt>Sous-total</dt><dd>{euro(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Livraison</dt><dd>{shipping === 0 ? "Offerte" : euro(shipping)}</dd></div>
              <div className="flex justify-between border-t border-sand pt-3 font-medium"><dt>Total</dt><dd>{euro(subtotal + shipping)}</dd></div>
            </dl>
            <p className="mt-4 text-xs font-light leading-relaxed text-ink/60">
              Livraison atelier en 5 à 10 jours, offerte dès {euro(FREE_SHIPPING_FROM)}. L'express se choisit à l'étape suivante.
            </p>
            <Button href="/commander" className="mt-6 w-full">Passer la commande</Button>
            <Button href="/catalogue" variant="quiet" className="mt-4">Continuer mes achats</Button>
          </aside>
        </div>
      )}
      {complements.length > 0 && lines.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-serif text-4xl">Complétez votre intérieur</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {complements.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
