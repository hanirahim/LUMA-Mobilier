"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createSeed } from "@/lib/seed";
import type {
  AccountSnapshot,
  Address,
  CartItem,
  Category,
  Database,
  Product,
  Profile,
  Review,
} from "@/lib/types";
import type { Client } from "@/lib/types";

const LOCAL_KEY = "luma-atelier-local";

type LocalState = {
  cart: CartItem[];
  favorites: string[];
  profile: Profile;
  addresses: Address[];
};

type AdminState = Database & { clients: Client[] };

type Catalog = {
  products: Product[];
  categories: Category[];
  reviews: Review[];
};

const emptyProfile: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
};

const emptyAccount: AccountSnapshot = {
  orders: [],
  rentals: [],
  reservations: [],
  quotes: [],
};

const initial = createSeed();

const defaultLocal: LocalState = {
  cart: [],
  favorites: [],
  profile: emptyProfile,
  addresses: [],
};

type Store = {
  catalogReady: boolean;
  products: Product[];
  categories: Category[];
  reviews: Review[];
  cart: CartItem[];
  favorites: string[];
  profile: Profile;
  addresses: Address[];
  account: AccountSnapshot;
  accountReady: boolean;
  admin: boolean;
  adminData: AdminState | null;
  notice: string | null;
  toast: (message: string) => void;
  refreshCatalog: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
  addToCart: (item: Omit<CartItem, "lineId">, name: string) => void;
  updateCart: (lineId: string, patch: Partial<CartItem>) => void;
  removeFromCart: (lineId: string) => void;
  clearCart: (lineIds?: string[]) => void;
  toggleFavorite: (productId: string) => void;
  saveProfile: (profile: Profile) => void;
  saveAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  adminFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const StoreContext = createContext<Store | null>(null);

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Une erreur est survenue.");
  }
  return data;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>({
    products: initial.products,
    categories: initial.categories,
    reviews: initial.reviews.filter((review) => review.status === "publie"),
  });
  const [catalogReady, setCatalogReady] = useState(false);
  const [local, setLocal] = useState<LocalState>(defaultLocal);
  const [hydrated, setHydrated] = useState(false);
  const [account, setAccount] = useState<AccountSnapshot>(emptyAccount);
  const [accountReady, setAccountReady] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [adminData, setAdminData] = useState<AdminState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const toast = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LocalState>;
        setLocal({
          cart: (parsed.cart ?? []).filter((line) => line.mode !== "location"),
          favorites: parsed.favorites ?? [],
          profile: { ...emptyProfile, ...parsed.profile },
          addresses: parsed.addresses ?? [],
        });
      }
    } catch {
      setLocal(defaultLocal);
    }
    setAdmin(sessionStorage.getItem("luma-admin") === "1");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
  }, [local, hydrated]);

  const refreshCatalog = useCallback(async () => {
    try {
      const response = await fetch("/api/catalog", { cache: "no-store" });
      const data = await readJson(response);
      setCatalog({
        products: data.products,
        categories: data.categories,
        reviews: data.reviews,
      });
    } catch {
      /* Le catalogue embarqué reste affiché. */
    } finally {
      setCatalogReady(true);
    }
  }, []);

  const refreshAccount = useCallback(async () => {
    const email = local.profile.email.trim();
    if (!email) {
      setAccount(emptyAccount);
      setAccountReady(true);
      return;
    }
    setAccountReady(false);
    try {
      const response = await fetch(`/api/account?email=${encodeURIComponent(email)}`, { cache: "no-store" });
      setAccount(await readJson(response));
    } catch {
      setAccount(emptyAccount);
    } finally {
      setAccountReady(true);
    }
  }, [local.profile.email]);

  const adminFetch = useCallback(async (path: string, init?: RequestInit) => {
    const key = sessionStorage.getItem("luma-admin-key") ?? "";
    return fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-luma-admin": key,
        ...(init?.headers ?? {}),
      },
    });
  }, []);

  const refreshAdmin = useCallback(async () => {
    if (sessionStorage.getItem("luma-admin") !== "1") return;
    const response = await adminFetch("/api/admin", { cache: "no-store" });
    setAdminData(await readJson(response));
  }, [adminFetch]);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    if (hydrated) void refreshAccount();
  }, [hydrated, refreshAccount]);

  const value = useMemo<Store>(
    () => ({
      catalogReady,
      products: catalog.products,
      categories: catalog.categories,
      reviews: catalog.reviews,
      cart: local.cart,
      favorites: local.favorites,
      profile: local.profile,
      addresses: local.addresses,
      account,
      accountReady,
      admin,
      adminData,
      notice,
      toast,
      refreshCatalog,
      refreshAccount,
      refreshAdmin,
      addToCart: (item, name) => {
        setLocal((prev) => {
          const existing = prev.cart.find(
            (line) =>
              line.productId === item.productId &&
              line.mode === item.mode &&
              line.color === item.color &&
              (line.material ?? "") === (item.material ?? "") &&
              (line.finish ?? "Naturelle") === (item.finish ?? "Naturelle") &&
              line.mode === "achat",
          );
          if (existing) {
            return {
              ...prev,
              cart: prev.cart.map((line) =>
                line.lineId === existing.lineId ? { ...line, quantity: line.quantity + item.quantity } : line,
              ),
            };
          }
          return { ...prev, cart: [...prev.cart, { ...item, mode: "achat", lineId: crypto.randomUUID() }] };
        });
        toast(`${name} a rejoint votre panier.`);
      },
      updateCart: (lineId, patch) => {
        setLocal((prev) => ({
          ...prev,
          cart: prev.cart
            .map((line) => (line.lineId === lineId ? { ...line, ...patch } : line))
            .filter((line) => line.quantity > 0),
        }));
      },
      removeFromCart: (lineId) => {
        setLocal((prev) => ({ ...prev, cart: prev.cart.filter((line) => line.lineId !== lineId) }));
      },
      clearCart: (lineIds) => {
        setLocal((prev) => ({
          ...prev,
          cart: lineIds ? prev.cart.filter((line) => !lineIds.includes(line.lineId)) : [],
        }));
      },
      toggleFavorite: (productId) => {
        setLocal((prev) => ({
          ...prev,
          favorites: prev.favorites.includes(productId)
            ? prev.favorites.filter((id) => id !== productId)
            : [...prev.favorites, productId],
        }));
      },
      saveProfile: (profile) => {
        setLocal((prev) => ({ ...prev, profile }));
        toast("Votre profil est enregistré.");
      },
      saveAddress: (address) => {
        setLocal((prev) => {
          const exists = prev.addresses.some((item) => item.id === address.id);
          return {
            ...prev,
            addresses: exists
              ? prev.addresses.map((item) => (item.id === address.id ? address : item))
              : [...prev.addresses, address],
          };
        });
        toast("Adresse enregistrée.");
      },
      removeAddress: (id) => {
        setLocal((prev) => ({ ...prev, addresses: prev.addresses.filter((item) => item.id !== id) }));
      },
      loginAdmin: async (password) => {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await response.json();
        if (!data.ok) return false;
        sessionStorage.setItem("luma-admin", "1");
        sessionStorage.setItem("luma-admin-key", password);
        setAdmin(true);
        const adminResponse = await fetch("/api/admin", {
          cache: "no-store",
          headers: { "x-luma-admin": password },
        });
        setAdminData(await readJson(adminResponse));
        return true;
      },
      logoutAdmin: () => {
        sessionStorage.removeItem("luma-admin");
        sessionStorage.removeItem("luma-admin-key");
        setAdmin(false);
        setAdminData(null);
      },
      adminFetch,
    }),
    [
      account,
      accountReady,
      admin,
      adminData,
      adminFetch,
      catalog,
      catalogReady,
      local,
      notice,
      refreshAccount,
      refreshAdmin,
      refreshCatalog,
      toast,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Le store LUMA est introuvable.");
  return store;
}
