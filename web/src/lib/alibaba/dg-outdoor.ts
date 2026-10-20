/** DG Outdoor / Express Garden category mapping, Preview import staging only.
 * Original supplier taxonomy is preserved for round-trip verification.
 * No product is made sellable until prices, MOQ, shipping and rights are reviewed.
 */
export const DG_OUTDOOR_SUPPLIER = {
  name: "DG OUTDOOR FURNITURE MANUFACTUR LTD",
  storefront: "https://expressgarden.en.alibaba.com/",
  slug: "dg-outdoor-express-garden",
} as const;

export const DG_OUTDOOR_CATEGORIES = [
  { supplier: "Garden Sofa", label: "Canapés de jardin", slug: "canapes-de-jardin" },
  { supplier: "Table & Chair", label: "Tables et chaises d’extérieur", slug: "tables-chaises-exterieur" },
  { supplier: "Sun Lounger & Daybed", label: "Transats et lits de jardin", slug: "transats-lits-de-jardin" },
  { supplier: "Bar Tables & Chairs", label: "Tables et chaises de bar", slug: "tables-chaises-de-bar" },
  { supplier: "Balcony Set", label: "Ensembles de balcon", slug: "ensembles-de-balcon" },
  { supplier: "Patio Swing", label: "Balançoires de jardin", slug: "balancoires-de-jardin" },
  { supplier: "Parasols", label: "Parasols", slug: "parasols" },
  { supplier: "Public Seating & Bin", label: "Mobilier pour espaces publics", slug: "mobilier-espaces-publics" },
  { supplier: "Ungrouped", label: "Non classés", slug: "non-classes" },
] as const;

export type DgOutdoorDraft = {
  supplierProductId: string;
  supplierUrl: string;
  originalCategory: string;
  title: string;
  description?: string;
  images: string[];
  attributes: Record<string, string>;
  variants: Array<{ name: string; value: string; sku?: string }>;
  supplierCurrency?: string;
  supplierPriceRange?: { min: number; max: number };
  minimumOrderQuantity?: number;
  status: "draft";
  verifiedAt?: string;
};

/** Fail closed: unknown categories are not silently assigned to a LUMA category. */
export function matchDgOutdoorCategory(originalCategory: string) {
  return DG_OUTDOOR_CATEGORIES.find(
    (item) => item.supplier.toLowerCase() === originalCategory.trim().toLowerCase(),
  ) ?? null;
}
