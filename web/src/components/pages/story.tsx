import Link from "next/link";
import { Photo } from "@/components/product-card";
import { Button, Container, Eyebrow } from "@/components/ui";

const rooms = [
  {
    title: "Le déjeuner du dimanche",
    text: "Une table assez longue, des chaises qui ne fatiguent pas, la lumière de la fenêtre.",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1600&q=80",
    href: "/catalogue?categorie=tables",
  },
  {
    title: "Une chambre qui respire",
    text: "Peu de meubles, un lit bas, du lin. Le reste peut attendre.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80",
    href: "/catalogue?categorie=lits",
  },
  {
    title: "Le calme d'un salon",
    text: "Un fauteuil, une table basse, un endroit où poser le livre.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
    href: "/catalogue?categorie=chaises",
  },
  {
    title: "Recevoir, sans tout changer",
    text: "Des tables et des assises pour recevoir, sans changer le reste de la maison.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    href: "/catalogue?categorie=tabourets",
  },
];

export function InspirationPage() {
  return (
    <Container className="py-12 md:py-16">
      <Eyebrow>Inspiration</Eyebrow>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[0.95] md:text-7xl">Des meubles pensés pour vivre avec vous.</h1>
      <div className="mt-12 grid gap-10">
        {rooms.map((room, index) => (
          <article key={room.title} className={`grid items-center gap-6 md:grid-cols-2 ${index % 2 ? "md:[&>a]:order-2" : ""}`}>
            <Link href={room.href} className="group">
              <Photo src={room.image} alt={room.title} className="aspect-[4/3] rounded-[1.5rem]" sizes="(min-width: 768px) 50vw, 100vw" />
            </Link>
            <div className={index % 2 ? "md:pr-8" : "md:pl-8"}>
              <h2 className="font-serif text-4xl">{room.title}</h2>
              <p className="mt-4 max-w-sm font-light leading-relaxed text-ink/70">{room.text}</p>
              <Button href={room.href} variant="quiet" className="mt-5">
                Voir les pièces
              </Button>
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}

export function AtelierPage() {
  return (
    <>
      <Container className="py-16 md:py-24">
        <Eyebrow>L'atelier</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] md:text-7xl">Une maison française, pas un magasin de plus.</h1>
        <div className="mt-10 grid gap-8 text-lg font-light leading-relaxed text-ink/75 md:grid-cols-2">
          <p>
            LUMA dessine des chaises, des tables, des tabourets et des lits pour les maisons, les bureaux et les lieux qui reçoivent. Le ton est simple. Les matières sont choisies pour durer et se patiner.
          </p>
          <p>
            LUMA dessine des chaises, des tables, des tabourets et des lits pour les maisons, les bureaux et les lieux qui reçoivent. On achète une pièce pour la garder. Quelqu'un lit votre message et répond avec un devis clair.
          </p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            ["La maison", "Des meubles qui restent, et avec lesquels on vit vraiment."],
            ["Les professionnels", "Accueil, salle de réunion, cabinet, boutique."],
            ["Les événements", "Une table, des assises, une installation pour un soir."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-[1.4rem] bg-sand/50 p-6">
              <h2 className="font-serif text-3xl">{title}</h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink/70">{text}</p>
            </article>
          ))}
        </div>
        <Button href="/devis" className="mt-12">
          Écrire à l'atelier
        </Button>
      </Container>
      <section className="bg-ink py-20 text-ivory">
        <Container>
          <p className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">Découvrez l'univers LUMA.</p>
        </Container>
      </section>
    </>
  );
}
