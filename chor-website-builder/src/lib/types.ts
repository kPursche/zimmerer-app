// Gemeinsame Typen fuer den Chor-Website-Builder.

/** Die fuenf waehlbaren Ziele einer Chor-Website. */
export type ChoirGoalId =
  | "neue-saenger"
  | "konzerte"
  | "buchung"
  | "foerderer"
  | "vorstellung";

/** Woher ein Bild beim Crawlen stammt. */
export type ImageSource =
  | "img"
  | "srcset"
  | "picture"
  | "background"
  | "og"
  | "link";

/** Ein beim Crawlen gefundenes Bild. */
export interface ExtractedImage {
  /** Absolute URL des Bildes. */
  url: string;
  /** alt-Text bzw. beschreibender Text, falls vorhanden. */
  alt: string;
  /** Fundort im HTML. */
  source: ImageSource;
  /** Intrinsische Breite, falls aus dem HTML bekannt. */
  width: number | null;
  /** Intrinsische Hoehe, falls aus dem HTML bekannt. */
  height: number | null;
}

/** Ergebnis eines Crawl-Vorgangs. */
export interface CrawlResult {
  pageUrl: string;
  title: string | null;
  images: ExtractedImage[];
}

/** Verfuegbare Bildfilter. */
export type FilterName =
  | "none"
  | "grayscale"
  | "sepia"
  | "warm"
  | "cool"
  | "high-contrast"
  | "soft";

/** Bildbearbeitungs-Operationen, serverseitig via sharp angewendet. */
export interface ProcessOps {
  resize?: { width?: number; height?: number; fit?: "cover" | "contain" | "inside" };
  crop?: { left: number; top: number; width: number; height: number };
  filter?: FilterName;
  /** Hintergrund per KI entfernen (benoetigt REMOVE_BG_API_KEY). */
  removeBackground?: boolean;
  /** Hex-Farbe, auf die nach dem Freistellen komponiert wird. null = transparent. */
  backgroundColor?: string | null;
  format?: "png" | "jpeg" | "webp";
  /** 1-100, nur fuer jpeg/webp. */
  quality?: number;
}

/** Ergebnis von /api/process. */
export interface ProcessResult {
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

/** Ein vorgeschlagener Abschnitt der spaeter zu generierenden Website. */
export interface SectionSuggestion {
  /** Maschinenlesbarer Typ, z.B. "hero", "galerie", "termine". */
  type: string;
  /** Ueberschrift fuer den Abschnitt. */
  title: string;
  /** Kurze Begruendung, warum dieser Abschnitt zum Ziel passt. */
  rationale: string;
  /** URLs der vorgeschlagenen Bilder fuer diesen Abschnitt. */
  imageUrls: string[];
}

/** Ergebnis von /api/recommend. */
export interface Recommendation {
  goals: ChoirGoalId[];
  /** Quelle der Empfehlung: KI oder regelbasierter Fallback. */
  source: "ai" | "fallback";
  headline: string;
  sections: SectionSuggestion[];
}
