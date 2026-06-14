import { z } from "zod"

/**
 * Zod-Schema und Auswahl-Optionen für das Animations-Briefing-Formular (PROJ-1).
 *
 * Dieses Schema ist die EINZIGE Wahrheit für die Validierung und wird sowohl
 * im Browser (react-hook-form) als auch später serverseitig (API-Route) genutzt.
 */

// --- Auswahl-Optionen (anpassbare Defaults laut Spec) ---

export const PRODUKTKATEGORIEN = [
  "Vitamin/Mineral",
  "Pre-Workout",
  "Schlaf/Entspannung",
  "Darmgesundheit",
  "Protein",
  "Beauty",
  "Sonstiges",
] as const

export const DARREICHUNGSFORMEN = [
  "Kapsel",
  "Tablette",
  "Pulver",
  "Liquid",
  "Gummies",
  "Sonstiges",
] as const

export const TONALITAETEN = [
  "seriös-medizinisch",
  "sportlich-energetisch",
  "natürlich-clean",
  "premium-luxuriös",
  "verspielt",
  "Sonstiges",
] as const

export const AUFTRAGSARTEN = [
  "Einzelne Video-Animation",
  "Ganze Werbekampagne",
] as const

export const LAENGEN = ["15s", "30s", "60s", "Sonstiges"] as const

export const SEITENVERHAELTNISSE = [
  { id: "9:16", label: "9:16 Reels/TikTok" },
  { id: "1:1", label: "1:1 (z. B. Feed)" },
  { id: "16:9", label: "16:9 YouTube" },
] as const

export const WIRKUNGSORTE = [
  { id: "darm", label: "Darm" },
  { id: "muskel", label: "Muskel" },
  { id: "gehirn", label: "Gehirn" },
  { id: "blutbahn", label: "Blutbahn" },
  { id: "haut", label: "Haut" },
  { id: "gelenke", label: "Gelenke" },
  { id: "immunsystem", label: "Immunsystem" },
] as const

// --- Upload-Beschränkungen ---

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const
export const ALLOWED_IMAGE_LABEL = "JPG, PNG oder WEBP, max. 10 MB pro Datei"

// --- Hilfs-Validatoren ---

const requiredText = (label: string) =>
  z.string().trim().min(1, { message: `${label} ist ein Pflichtfeld.` })

// Datei-Validierung läuft nur im Browser (File-API ist serverseitig nicht vorhanden).
// Im SSR-Kontext existiert `File` nicht – dann überspringen wir die instanceof-Prüfung.
const isFileLike = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File

const imageFileSchema = z
  .custom<File>(isFileLike, { message: "Ungültige Datei." })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `Datei ist zu groß (max. ${MAX_FILE_SIZE / (1024 * 1024)} MB).`,
  })
  .refine(
    (file) => ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]),
    { message: `Nicht erlaubtes Format. Erlaubt: ${ALLOWED_IMAGE_LABEL}.` },
  )

const optionalFileSchema = z
  .custom<File>(isFileLike, { message: "Ungültige Datei." })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `Datei ist zu groß (max. ${MAX_FILE_SIZE / (1024 * 1024)} MB).`,
  })

// --- Haupt-Schema ---

export const briefingSchema = z.object({
  // Abschnitt 1: Auftraggeber / Kontakt
  firma: requiredText("Firma / Marke"),
  ansprechpartner: requiredText("Ansprechpartner"),
  email: z
    .string()
    .trim()
    .min(1, { message: "E-Mail ist ein Pflichtfeld." })
    .email({ message: "Bitte eine gültige E-Mail-Adresse eingeben." }),
  telefon: z.string().trim().optional().or(z.literal("")),
  links: z.array(z.object({ url: z.string().trim() })).optional(),

  // Abschnitt 2: Produkt-Basics
  produktname: requiredText("Produktname"),
  produktkategorie: z.enum(PRODUKTKATEGORIEN, {
    message: "Bitte eine Produktkategorie wählen.",
  }),
  produktkategorieSonstiges: z.string().trim().optional().or(z.literal("")),
  darreichungsform: z.enum(DARREICHUNGSFORMEN, {
    message: "Bitte eine Darreichungsform wählen.",
  }),
  darreichungsformSonstiges: z.string().trim().optional().or(z.literal("")),
  kurzbeschreibung: requiredText("Kurzbeschreibung"),

  // Abschnitt 3: Wirkung & Inhaltsstoffe
  inhaltsstoffe: requiredText("Hauptwirkstoffe / Inhaltsstoffe"),
  wirkmechanismus: requiredText("Wirkmechanismus"),
  wirkungsorte: z
    .array(z.string())
    .min(1, { message: "Bitte mindestens einen Wirkungsort auswählen." }),
  wirkungsorteFreitext: z.string().trim().optional().or(z.literal("")),
  vorteile: requiredText("Die 3 wichtigsten Vorteile"),
  verboteneClaims: z.string().trim().optional().or(z.literal("")),

  // Abschnitt 4: Zielgruppe & Tonalität
  zielgruppe: requiredText("Zielgruppe"),
  geloestesProblem: requiredText("Gelöstes Problem"),
  tonalitaet: z.enum(TONALITAETEN, {
    message: "Bitte eine Tonalität wählen.",
  }),
  tonalitaetSonstiges: z.string().trim().optional().or(z.literal("")),

  // Abschnitt 5: Umfang & Format
  auftragsart: z.enum(AUFTRAGSARTEN, {
    message: "Bitte die Art des Auftrags wählen.",
  }),
  laenge: z.enum(LAENGEN, { message: "Bitte eine gewünschte Länge wählen." }),
  laengeSonstiges: z.string().trim().optional().or(z.literal("")),
  seitenverhaeltnisse: z
    .array(z.string())
    .min(1, { message: "Bitte mindestens ein Seitenverhältnis auswählen." }),
  voiceover: z.enum(["ja", "nein"], {
    message: "Bitte angeben, ob ein Voiceover gewünscht ist.",
  }),
  textOverlays: z.enum(["ja", "nein"]).optional(),
  musikStil: z.string().trim().optional().or(z.literal("")),
  sprachen: requiredText("Sprache(n)"),

  // Abschnitt 6: Visuals & Assets (Dateien werden separat im Formular gehalten)
  brandFarben: z.string().trim().optional().or(z.literal("")),
  brandSchriften: z.string().trim().optional().or(z.literal("")),
  referenzLinks: z.array(z.object({ url: z.string().trim() })).optional(),

  // Abschnitt 7: Rahmenbedingungen
  deadline: z.string().trim().optional().or(z.literal("")),
  budget: z.string().trim().optional().or(z.literal("")),
  callToAction: z.string().trim().optional().or(z.literal("")),
  anmerkungen: z.string().trim().optional().or(z.literal("")),

  // Abschluss
  datenschutz: z.literal(true, {
    message: "Bitte der Datenschutzerklärung zustimmen, um abzusenden.",
  }),

  // Spam-Schutz (Honeypot) – muss leer bleiben
  website_hp: z.string().max(0).optional(),
})

export type BriefingFormValues = z.infer<typeof briefingSchema>

// Datei-Validatoren werden vom Formular für die manuell verwalteten Uploads genutzt.
export { imageFileSchema, optionalFileSchema }
