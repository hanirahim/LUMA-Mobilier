import Link from "next/link";
import { cx } from "@/lib/format";

const variants = {
  primary: "bg-ink text-ivory hover:bg-ink/85",
  gold: "bg-gold text-ink hover:bg-[#b8955d]",
  ghost: "border border-ink/15 bg-transparent text-ink hover:bg-ink/[0.04]",
  quiet: "bg-transparent px-0 text-ink/75 underline-offset-4 hover:text-ink hover:underline",
};

type ButtonProps = {
  href?: string;
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({ href, variant = "primary", className, children, ...props }: ButtonProps) {
  const cls = cx(
    "inline-flex h-12 items-center justify-center rounded-full px-6 text-sm tracking-wide transition duration-300 disabled:pointer-events-none disabled:opacity-40",
    variant === "quiet" && "h-auto rounded-none px-0 py-1",
    variants[variant],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-6xl px-5 md:px-8", className)}>{children}</div>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.72rem] uppercase tracking-[0.28em] text-wood">{children}</p>;
}

export function Field({
  label,
  className,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-2 block text-[0.72rem] uppercase tracking-[0.16em] text-ink/55">{label}</span>
      <input
        {...props}
        className="h-12 w-full rounded-2xl border border-sand bg-white px-4 text-sm outline-none transition focus:border-wood"
      />
    </label>
  );
}

export function TextArea({
  label,
  className,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-2 block text-[0.72rem] uppercase tracking-[0.16em] text-ink/55">{label}</span>
      <textarea
        {...props}
        className="min-h-32 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-wood"
      />
    </label>
  );
}

export function Select({
  label,
  children,
  className,
  ...props
}: { label?: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const control = (
    <select
      {...props}
      className="h-12 w-full rounded-2xl border border-sand bg-white px-4 text-sm outline-none transition focus:border-wood"
    >
      {children}
    </select>
  );
  if (!label) return control;
  return (
    <label className={cx("block", className)}>
      <span className="mb-2 block text-[0.72rem] uppercase tracking-[0.16em] text-ink/55">{label}</span>
      {control}
    </label>
  );
}

export function Stepper({
  value,
  min = 1,
  max = 12,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-sand bg-white">
      <button
        type="button"
        className="h-11 w-11 text-lg"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Diminuer la quantité"
      >
        –
      </button>
      <span className="w-6 text-center text-sm">{value}</span>
      <button
        type="button"
        className="h-11 w-11 text-lg"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Augmenter la quantité"
      >
        +
      </button>
    </div>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-sand/70 px-4 py-3 text-sm text-ink/80">{children}</p>;
}
