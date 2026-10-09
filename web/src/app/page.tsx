import type { Metadata } from "next";
import { HomePage } from "@/components/pages/home";

export const metadata: Metadata = {
  title: { absolute: "LUMA — Le mobilier qui vous ressemble." },
};

export default function Page() {
  return <HomePage />;
}
