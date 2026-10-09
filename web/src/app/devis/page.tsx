import type { Metadata } from "next";
import { Suspense } from "react";
import { QuotePage } from "@/components/pages/quote";

export const metadata: Metadata = { title: "Demander un devis" };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <QuotePage />
    </Suspense>
  );
}
