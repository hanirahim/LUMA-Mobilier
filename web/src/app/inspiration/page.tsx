import type { Metadata } from "next";
import { InspirationPage } from "@/components/pages/story";

export const metadata: Metadata = { title: "Inspiration" };

export default function Page() {
  return <InspirationPage />;
}
