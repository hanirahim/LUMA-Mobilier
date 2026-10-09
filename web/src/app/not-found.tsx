import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-sm tracking-[0.28em]">LUMA</p>
      <h1 className="mt-4 font-serif text-5xl">Cette page s'est égarée.</h1>
      <p className="mt-4 font-light text-ink/70">Revenons vers les meubles.</p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm text-ivory">
        Retour à l'accueil
      </Link>
    </div>
  );
}
