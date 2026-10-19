export type CategoryId = "chaises" | "tables" | "tabourets" | "lits";

export type Availability = "en_stock" | "sur_commande" | "indisponible";

export type ProductColor = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  price: number;
  rentPerDay: number;
  description: string;
  details: string;
  dimensions: {
    largeur: number;
    hauteur: number;
    profondeur: number;
  };
  materials: string[];
  colors: ProductColor[];
  images: string[];
  availability: Availability;
  stock: number;
  popular: boolean;
  isNew: boolean;
  source?: {
    marketplace: "Alibaba";
    url: string;
    productId?: string;
    subject?: string;
    wholesale: string;
    purchase?: number;
    transport?: number;
    moq?: number;
    attributes?: { name: string; value: string }[];
    supplier?: {
      name: string;
      storeUrl?: string;
      origin?: string;
    };
  };
};

export type Category = {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
  image: string;
};

export type CartMode = "achat" | "location";

export type CartItem = {
  lineId: string;
  productId: string;
  mode: CartMode;
  quantity: number;
  color: string;
  material?: string;
  finish?: string;
  rentalStart?: string;
  rentalEnd?: string;
};

export type Address = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
};

export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
};

export type OrderStatus =
  | "confirmee"
  | "en_preparation"
  | "expediee"
  | "en_livraison"
  | "livree"
  | "annulee";

export type OrderLine = {
  productId: string;
  name: string;
  color: string;
  quantity: number;
  unitPrice: number;
  image: string;
};

export type Order = {
  id: string;
  createdAt: string;
  email: string;
  customer: Profile;
  items: OrderLine[];
  delivery: Address;
  shipping: number;
  discount: number;
  promoCode?: string;
  total: number;
  status: OrderStatus;
  note: string;
  shippingMethod?: string;
  paymentLabel?: string;
};

export type RentalStatus = "confirmee" | "en_cours" | "terminee" | "annulee";

export type RentalLine = {
  productId: string;
  name: string;
  color: string;
  quantity: number;
  unitPerDay: number;
  days: number;
  lineTotal: number;
  start: string;
  end: string;
  image: string;
};

export type Rental = {
  id: string;
  createdAt: string;
  email: string;
  customer: Profile;
  items: RentalLine[];
  delivery: Address;
  pickup: Address;
  note: string;
  shipping: number;
  total: number;
  status: RentalStatus;
};

export type ReservationStatus = "demandee" | "confirmee" | "annulee";

export type Reservation = {
  id: string;
  createdAt: string;
  email: string;
  customerName: string;
  phone: string;
  productId: string;
  productName: string;
  quantity: number;
  date: string;
  note: string;
  status: ReservationStatus;
};

export type QuoteStatus =
  | "nouveau"
  | "en_cours"
  | "envoye"
  | "accepte"
  | "refuse";

export type QuoteItem = {
  productId: string;
  name: string;
  quantity: number;
};

export type Quote = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  items: QuoteItem[];
  desiredDate: string;
  message: string;
  address: string;
  status: QuoteStatus;
  projectType?: string;
  budget?: string;
};

export type ReviewStatus = "publie" | "en_attente" | "masque";

export type Review = {
  id: string;
  productId: string;
  author: string;
  city: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
  verified?: boolean;
};

export type Promotion = {
  id: string;
  code: string;
  label: string;
  percent: number;
  active: boolean;
};

export type Client = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  orders: number;
  rentals: number;
  quotes: number;
};

export type Database = {
  products: Product[];
  categories: Category[];
  reviews: Review[];
  promotions: Promotion[];
  orders: Order[];
  rentals: Rental[];
  reservations: Reservation[];
  quotes: Quote[];
  newsletter: string[];
  contacts: { id: string; name: string; email: string; message: string; createdAt: string }[];
};

export type AccountSnapshot = {
  orders: Order[];
  rentals: Rental[];
  reservations: Reservation[];
  quotes: Quote[];
};
