import type { Metadata } from "next";
import { AtelierPage } from "@/components/pages/story";

export const metadata: Metadata = { title: "L'atelier" };

export default function Page() {
  return <AtelierPage />;
}
