"use client";

import { AdminFrame } from "@/components/pages/admin";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminFrame>{children}</AdminFrame>;
}
