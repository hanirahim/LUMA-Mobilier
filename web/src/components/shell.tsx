"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { useStore } from "./store";
import { Container } from "./ui";

const links = [
  { href: "/catalogue", label: "Boutique" },
  { href: "/collections/living", label: "Collections" },
  { href: "/univers", label: "Inspiration" },
  { href: "/pro", label: "LUMA PRO" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  const { notice } = useStore();

  return (
    <>
      {admin ? null : <Header />}
      <div className={admin ? "min-h-screen" : "flex flex-1 flex-col pt-[4.5rem]"}>{children}</div>
      {admin ? null : <Footer />}
      {admin ? null : (
        <Link href="/contact" className="fixed bottom-5 right-5 z-40 rounded-full bg-ink px-5 py-3 text-sm text-ivory">
          Écrire
        </Link>
      )}
      {notice ? (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm text-ivory shadow-lg">
          {notice}
        </div>
      ) : null}
    </>
  );
}

function Header() {
  const pathname = usePathname();
  const { cart } = useStore();
  const [open, setOpen] = useState(false);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-sand/80 bg-ivory/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ink/80 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <IconLink href="/compte/favoris" label="Favoris">
            <Heart />
          </IconLink>
          <IconLink href="/panier" label="Panier">
            <Bag />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] text-ink">
                {count}
              </span>
            ) : null}
          </IconLink>
          <IconLink href="/compte" label="Compte">
            <Person />
          </IconLink>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center md:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="flex w-5 flex-col gap-1.5">
              <span className="h-px bg-ink" />
              <span className="h-px bg-ink" />
              <span className="h-px bg-ink" />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-sand bg-ivory px-6 py-8 md:hidden">
          <nav className="flex flex-col gap-5 font-serif text-4xl">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} className="relative grid h-11 w-11 place-items-center text-ink">
      {children}
    </Link>
  );
}

function Footer() {
  const columns = [
    ["Boutique", [["/catalogue", "Chaises, tables, tabourets, lits"], ["/catalogue?categorie=chaises", "Chaises"], ["/catalogue?categorie=tables", "Tables"], ["/catalogue?categorie=tabourets", "Tabourets"], ["/catalogue?categorie=lits", "Lits"]]],
    ["La maison", [["/collections/living", "Collections"], ["/univers", "Inspiration"], ["/ambiances", "Ambiances"], ["/style", "Votre style"], ["/pro", "LUMA PRO"], ["/a-propos", "À propos"], ["/atelier", "L'atelier"]]],
    ["Service", [["/contact", "Contact"], ["/faq", "FAQ"], ["/livraison", "Livraison"], ["/retours", "Retours"], ["/conditions", "Conditions générales"], ["/confidentialite", "Politique de confidentialité"]]],
  ] as const;
  return (
    <footer className="border-t border-sand bg-ivory">
      <Container className="grid gap-10 py-16 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs font-serif text-2xl leading-snug">Le mobilier qui vous ressemble.</p>
          <p className="mt-3 text-sm font-light text-ink/60">Créez un intérieur à votre image.</p>
        </div>
        {columns.map(([title, items]) => (
          <div key={title}>
            <p className="text-[0.72rem] uppercase tracking-[0.2em] text-wood">{title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map(([href, label]) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-sand/80">
        <Container className="flex flex-col gap-3 py-6 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>LUMA · Mobilier français contemporain</p>
          <p className="flex gap-4">
            <span>Instagram</span>
            <span>Pinterest</span>
            <Link href="/contact">Newsletter via l'accueil</Link>
          </p>
        </Container>
      </div>
    </footer>
  );
}

function Heart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
    </svg>
  );
}

function Bag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );
}

function Person() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 19c1.5-3 3.8-4.5 7-4.5S17.5 16 19 19" />
    </svg>
  );
}
