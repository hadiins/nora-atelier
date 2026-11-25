export type CategoryType = "ALL" | "WOMEN" | "MEN" | "KIDS" | "PERFUME";

export interface ProductVariantDTO {
  id: string;
  label: string;
  sku: string;
  stock: number;
}

export interface PerfumeNoteDTO {
  scentGroup: string;
  topNotes: string;
  midNotes: string;
  baseNotes: string;
  batchCode?: string | null;
}

export interface ProductDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "WOMEN" | "MEN" | "KIDS" | "PERFUME";
  price: number;
  oldPrice?: number | null;
  badge?: string | null;
  rating: number;
  images: string[];
  colors: string[];
  variants: ProductVariantDTO[];
  perfumeNote?: PerfumeNoteDTO | null;
}
