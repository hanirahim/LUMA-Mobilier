import { createSeed } from "@/lib/seed";
import type { CartItem, Order, Product, Profile, Rental, Reservation, Quote, Address } from "@/lib/types";
import { discountAmount, purchaseShipping } from "@/lib/pricing";
import { uid } from "@/lib/format";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "luma-mobile-v1";
const seed = createSeed();

const emptyProfile: Profile = { firstName: "", lastName: "", email: "", phone: "", company: "" };

type Local = {
  cart: CartItem[];
  favorites: string[];
  profile: Profile;
  addresses: Address[];
  orders: Order[];
  rentals: Rental[];
  reservations: Reservation[];
  quotes: Quote[];
};

const emptyLocal: Local = {
  cart: [],
  favorites: [],
  profile: emptyProfile,
  addresses: [],
  orders: [],
  rentals: [],
  reservations: [],
  quotes: [],
};

type Store = {
  ready: boolean;
  products: Product[];
  categories: typeof seed.categories;
  reviews: typeof seed.reviews;
  cart: CartItem[];
  favorites: string[];
  profile: Profile;
  addresses: Address[];
  orders: Order[];
  rentals: Rental[];
  reservations: Reservation[];
  quotes: Quote[];
  notice: string | null;
  toast: (message: string) => void;
  addToCart: (item: Omit<CartItem, "lineId">, name: string) => void;
  updateCart: (lineId: string, quantity: number) => void;
  removeFromCart: (lineId: string) => void;
  clearCart: (lineIds?: string[]) => void;
  toggleFavorite: (id: string) => void;
  saveProfile: (profile: Profile) => void;
  saveAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  confirmPurchase: (input: {
    customer: Profile;
    delivery: Address;
    note: string;
    promoCode: string;
    items: CartItem[];
  }) => Order;
  confirmRental: (input: {
    customer: Profile;
    delivery: Address;
    pickup: Address;
    note: string;
    items: CartItem[];
  }) => Rental;
  confirmReservation: (input: Omit<Reservation, "id" | "createdAt" | "status" | "productName"> & { productName: string }) => void;
  confirmQuote: (input: Omit<Quote, "id" | "createdAt" | "status">) => Quote;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [local, setLocal] = useState<Local>(emptyLocal);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setLocal({ ...emptyLocal, ...JSON.parse(raw) });
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) void AsyncStorage.setItem(KEY, JSON.stringify(local));
  }, [local, ready]);

  const toast = useCallback((message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 2600);
  }, []);

  const value = useMemo<Store>(() => {
    const find = (id: string) => seed.products.find((product) => product.id === id);

    return {
      ready,
      products: seed.products,
      categories: seed.categories,
      reviews: seed.reviews.filter((review) => review.status === "publie"),
      ...local,
      cart: local.cart.filter((line) => line.mode !== "location"),
      notice,
      toast,
      addToCart: (item, name) => {
        setLocal((prev) => {
          const existing = prev.cart.find(
            (line) =>
              line.productId === item.productId &&
              line.mode === "achat" &&
              line.color === item.color,
          );
          if (existing) {
            return {
              ...prev,
              cart: prev.cart.map((line) =>
                line.lineId === existing.lineId ? { ...line, quantity: line.quantity + item.quantity } : line,
              ),
            };
          }
          return { ...prev, cart: [...prev.cart.filter((line) => line.mode !== "location"), { ...item, mode: "achat", lineId: uid("lig") }] };
        });
        toast(`${name} a rejoint votre panier.`);
      },
      updateCart: (lineId, quantity) => {
        setLocal((prev) => ({
          ...prev,
          cart: prev.cart.map((line) => (line.lineId === lineId ? { ...line, quantity } : line)).filter((line) => line.quantity > 0),
        }));
      },
      removeFromCart: (lineId) => setLocal((prev) => ({ ...prev, cart: prev.cart.filter((line) => line.lineId !== lineId) })),
      clearCart: (lineIds) =>
        setLocal((prev) => ({
          ...prev,
          cart: lineIds ? prev.cart.filter((line) => !lineIds.includes(line.lineId)) : [],
        })),
      toggleFavorite: (id) =>
        setLocal((prev) => ({
          ...prev,
          favorites: prev.favorites.includes(id) ? prev.favorites.filter((item) => item !== id) : [...prev.favorites, id],
        })),
      saveProfile: (profile) => {
        setLocal((prev) => ({ ...prev, profile }));
        toast("Votre profil est enregistré.");
      },
      saveAddress: (address) => {
        setLocal((prev) => ({
          ...prev,
          addresses: prev.addresses.some((item) => item.id === address.id)
            ? prev.addresses.map((item) => (item.id === address.id ? address : item))
            : [...prev.addresses, address],
        }));
        toast("Adresse enregistrée.");
      },
      removeAddress: (id) => setLocal((prev) => ({ ...prev, addresses: prev.addresses.filter((item) => item.id !== id) })),
      confirmPurchase: ({ customer, delivery, note, promoCode, items }) => {
        if (!customer.firstName || !customer.lastName || !customer.email.includes("@")) {
          throw new Error("Indiquez votre nom et une adresse e-mail.");
        }
        if (!delivery.line1 || !delivery.postalCode || !delivery.city) throw new Error("L'adresse de livraison est incomplète.");
        let subtotal = 0;
        const lines = items.map((line) => {
          const product = find(line.productId);
          if (!product || product.availability === "indisponible") throw new Error("Une pièce n'est plus disponible.");
          if (product.availability === "en_stock" && line.quantity > product.stock) {
            throw new Error(`Il reste ${product.stock} exemplaire(s) de ${product.name}.`);
          }
          subtotal += product.price * line.quantity;
          return {
            productId: product.id,
            name: product.name,
            color: line.color,
            quantity: line.quantity,
            unitPrice: product.price,
            image: product.images[0],
          };
        });
        const code = promoCode.trim().toUpperCase();
        const promo = seed.promotions.find((item) => item.active && item.code === code);
        if (code && !promo) throw new Error("Ce code n'est pas reconnu.");
        const discount = promo ? discountAmount(subtotal, promo.percent) : 0;
        const shipping = purchaseShipping(subtotal);
        const order: Order = {
          id: uid("cmd"),
          createdAt: new Date().toISOString(),
          email: customer.email.toLowerCase(),
          customer,
          items: lines,
          delivery,
          shipping,
          discount,
          promoCode: promo?.code,
          total: subtotal - discount + shipping,
          status: "confirmee",
          note,
        };
        setLocal((prev) => ({ ...prev, orders: [order, ...prev.orders], profile: customer }));
        return order;
      },
      confirmRental: () => {
        throw new Error("LUMA vend uniquement du mobilier neuf.");
      },
      confirmReservation: () => {
        throw new Error("LUMA vend uniquement du mobilier neuf.");
      },
      confirmQuote: (input) => {
        if (!input.firstName || !input.lastName || !input.email.includes("@") || !input.phone || !input.address) {
          throw new Error("Complétez le nom, l'e-mail, le téléphone et l'adresse.");
        }
        if (!input.items.length) throw new Error("Ajoutez au moins une pièce.");
        const quote: Quote = { ...input, id: uid("dev"), createdAt: new Date().toISOString(), status: "nouveau" };
        setLocal((prev) => ({
          ...prev,
          quotes: [quote, ...prev.quotes],
          profile: {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            company: input.company,
          },
        }));
        return quote;
      },
    };
  }, [local, notice, ready, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error("Store LUMA introuvable.");
  return store;
}
