import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AmbiancePage } from "@/components/pages/experience";
import { scenes } from "@/lib/world";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const scene = scenes.find((item) => item.slug === slug);
  return { title: scene?.title ?? "Ambiance", description: scene?.line };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!scenes.some((item) => item.slug === slug)) notFound();
  return <AmbiancePage slug={slug} />;
}
