import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/pages/experience";

const titles: Record<string, string> = {
  living: "LUMA Living — mobilier de salon",
  dining: "LUMA Dining — tables et chaises",
  comfort: "LUMA Comfort — lits et chambre",
  event: "LUMA Event — mobilier professionnel",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: titles[id] ?? "Collection",
    description: "Mobilier contemporain français LUMA. Chaises, tables, tabourets et lits.",
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!titles[id]) notFound();
  return <CollectionPage id={id} />;
}
