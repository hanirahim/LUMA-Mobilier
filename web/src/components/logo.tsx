import Link from "next/link";

export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M11.5 31.5V23.8C11.5 16.4 17 11 24 11s12.5 5.4 12.5 12.8v7.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M16 31.5h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19.25 36.5h9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-ink" aria-label="LUMA, accueil">
      <Mark className={compact ? "h-7 w-7" : "h-9 w-9"} />
      <span className={`pt-1 font-serif font-medium leading-none ${compact ? "text-xl tracking-[0.18em]" : "text-[1.65rem] tracking-[0.22em]"}`}>LUMA</span>
    </Link>
  );
}

export function LogoMark() {
  return <Mark className="h-8 w-8" />;
}
