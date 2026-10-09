import type { CategoryId, Product } from "./types";

export type UniverseId = "living" | "dining" | "comfort" | "event";
export type StyleId = "minimaliste" | "naturel" | "contemporain" | "elegant" | "chaleureux";

export const universes: { id: UniverseId; name: string; line: string; image: string }[] = [
  {
    id: "living",
    name: "LUMA Living",
    line: "Des pièces pensées pour rendre chaque espace plus chaleureux.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "dining",
    name: "LUMA Dining",
    line: "Tables et chaises pour les repas qui s'attardent.",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "comfort",
    name: "LUMA Comfort",
    line: "Des chambres qui respirent, et dans lesquelles on reste.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "event",
    name: "LUMA Event",
    line: "Le mobilier des restaurants, hôtels, bureaux et grands projets.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
  },
];

export const styles: { id: StyleId; label: string }[] = [
  { id: "minimaliste", label: "Minimaliste" },
  { id: "naturel", label: "Naturel" },
  { id: "contemporain", label: "Contemporain" },
  { id: "elegant", label: "Élégant" },
  { id: "chaleureux", label: "Chaleureux" },
];

export function universesOf(product: Product): UniverseId[] {
  const list: UniverseId[] = [];
  if (product.category === "lits") list.push("comfort");
  else if (product.category === "tabourets" || /fauteuil|basse|console/i.test(product.name)) list.push("living");
  else list.push("dining");
  if (product.popular) list.push("event");
  return list;
}

export function stylesOf(product: Product): StyleId[] {
  const found = new Set<StyleId>(["contemporain"]);
  if (product.materials.some((item) => /bois|chêne|chene|noyer|rotin|lin|hêtre|hetre/i.test(item))) found.add("naturel");
  if (product.materials.some((item) => /velours|boucl|cuir|tissu/i.test(item))) found.add("chaleureux");
  if (product.price >= 1500) found.add("elegant");
  if (product.colors.some((item) => item.name === "Noir")) found.add("minimaliste");
  return [...found];
}

export function inUniverse(product: Product, id: string) {
  return universesOf(product).includes(id as UniverseId);
}

export const scenes = [
  {
    slug: "salle-a-manger",
    title: "Salle à manger LUMA",
    room: "Salle à manger",
    line: "Une table ronde, quatre chaises, et la lumière du soir.",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1800&q=80",
    items: [
      { id: "table-ronde-chene", quantity: 1 },
      { id: "chaise-velours-or", quantity: 4 },
    ],
  },
  {
    slug: "salon",
    title: "Salon LUMA",
    room: "Salon",
    line: "Un fauteuil, une table basse, et deux tabourets.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=80",
    items: [
      { id: "fauteuil-frene", quantity: 1 },
      { id: "table-travertin", quantity: 1 },
      { id: "tabouret-comptoir", quantity: 2 },
    ],
  },
  {
    slug: "chambre",
    title: "Chambre LUMA",
    room: "Chambre",
    line: "Un lit au dossier arrondi, pour une chambre calme.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=80",
    items: [{ id: "lit-boucle", quantity: 1 }],
  },
  {
    slug: "bureau",
    title: "Bureau LUMA",
    room: "Bureau",
    line: "Une chaise pour travailler au calme.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=80",
    items: [{ id: "chaise-velours-or", quantity: 1 }],
  },
  {
    slug: "espace-professionnel",
    title: "Espace professionnel",
    room: "Espace professionnel",
    line: "Pour un café, un hôtel, une salle qui reçoit.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1800&q=80",
    items: [
      { id: "table-ronde-chene", quantity: 2 },
      { id: "chaise-velours-or", quantity: 8 },
    ],
  },
];

export const stories = [
  {
    slug: "lumiere-du-soir",
    title: "La lumière du soir",
    theme: "Décoration",
    text: "Une table ronde, des chaises qui se parlent, et assez d'espace pour que la pièce respire. C'est souvent là que commence un intérieur LUMA.",
  },
  {
    slug: "choisir-une-chaise",
    title: "Choisir une chaise",
    theme: "Guide d'achat",
    text: "Regardez la hauteur du dossier, la matière sous la main, et le temps que vous passez à table. Une bonne chaise se fait oublier, puis se fait remarquer.",
  },
  {
    slug: "matieres-qui-vivent",
    title: "Des matières qui vivent",
    theme: "Tendances",
    text: "Chêne, lin, velours, bouclé. Rien qui brille trop fort. Tout ce qui se patine et reste beau après les années.",
  },
];

export const serviceFaq = [
  { q: "Livraison", a: "En France métropolitaine. L'atelier livre en 5 à 10 jours, l'express en 2 à 4 jours. Offerte dès 800 € pour la livraison atelier." },
  { q: "Paiement", a: "Carte bancaire ou virement. Le numéro complet de la carte n'est pas enregistré." },
  { q: "Retours", a: "14 jours pour changer d'avis, pièce non utilisée, dans son emballage. L'atelier organise l'enlèvement." },
  { q: "Garantie", a: "Deux ans sur la structure. Les tissus et les bois se patinent, ils ne sont pas couverts comme un défaut." },
  { q: "Entretien", a: "Un chiffon doux, de l'eau claire. Pas de solvant. Le bois aime une huile de temps en temps." },
  { q: "Disponibilité", a: "En stock, la pièce part de l'atelier. Sur commande, le délai est indiqué au devis." },
  { q: "Commandes professionnelles", a: "Restaurants, hôtels, bureaux, architectes : écrivez à LUMA PRO. Nous répondons avec une proposition claire." },
];

export function ratingOf(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10;
}

export function categoryUniverse(category: CategoryId): UniverseId {
  if (category === "lits") return "comfort";
  if (category === "tabourets") return "living";
  return "dining";
}
