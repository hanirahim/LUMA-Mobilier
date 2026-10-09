import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Shell } from "@/components/shell";
import { StoreProvider } from "@/components/store";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LUMA — Le mobilier qui vous ressemble.",
    template: "%s — LUMA",
  },
  description:
    "LUMA, mobilier contemporain français. Chaises, tables, tabourets et lits pour la maison et les projets professionnels.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full bg-ivory font-sans text-ink">
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
