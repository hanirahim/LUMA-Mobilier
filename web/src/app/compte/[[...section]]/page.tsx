import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountPage, type AccountSection } from "@/components/pages/account";

const sections: Record<string, AccountSection> = {
  profil: "profil",
  commandes: "commandes",
  factures: "factures",
  devis: "devis",
  favoris: "favoris",
  adresses: "adresses",
  historique: "historique",
};

const titles: Record<AccountSection, string> = {
  apercu: "Compte",
  profil: "Profil",
  commandes: "Commandes",
  factures: "Factures",
  devis: "Devis",
  favoris: "Favoris",
  adresses: "Adresses",
  historique: "Historique",
};

export async function generateMetadata({ params }: { params: Promise<{ section?: string[] }> }): Promise<Metadata> {
  const { section } = await params;
  const key = section?.[0];
  const id = key ? sections[key] : "apercu";
  return { title: id ? titles[id] : "Compte" };
}

export default async function Page({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section } = await params;
  const key = section?.[0];
  if (section && section.length > 1) notFound();
  if (key && !sections[key]) notFound();
  return <AccountPage section={key ? sections[key] : "apercu"} />;
}
