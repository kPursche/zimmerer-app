import {
  CalendarDays,
  HeartHandshake,
  Info,
  Mic2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ChoirGoalId } from "./types";

export interface ChoirGoal {
  id: ChoirGoalId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Abschnitte, die eine Website mit diesem Ziel betonen sollte. */
  sections: string[];
}

/**
 * Die waehlbaren Ziele einer Chor-Website. Diese Liste steuert sowohl die
 * Auswahl im UI als auch die (regelbasierte und KI-) Struktur-Empfehlung.
 */
export const CHOIR_GOALS: ChoirGoal[] = [
  {
    id: "neue-saenger",
    label: "Neue Sänger:innen gewinnen",
    description:
      "Mitgliederwerbung: Schnupperproben, „Mitsingen“-Aufruf, Stimmgruppen und Probenzeiten.",
    icon: Users,
    sections: ["hero", "mitsingen", "stimmgruppen", "probenzeiten", "galerie", "kontakt"],
  },
  {
    id: "konzerte",
    label: "Konzerte & Termine bewerben",
    description:
      "Veranstaltungskalender, kommende Auftritte und Eintritts-/Ticket-Infos im Mittelpunkt.",
    icon: CalendarDays,
    sections: ["hero", "termine", "naechstes-konzert", "galerie", "newsletter"],
  },
  {
    id: "buchung",
    label: "Auftritte/Buchung & Kontakt",
    description:
      "„Chor engagieren“: Repertoire, Anfrageformular und gute Erreichbarkeit.",
    icon: Mic2,
    sections: ["hero", "repertoire", "anfrage", "referenzen", "kontakt"],
  },
  {
    id: "foerderer",
    label: "Förderer & Spenden",
    description:
      "Fördermitgliedschaft, Spenden und Vereinsunterstützung sichtbar machen.",
    icon: HeartHandshake,
    sections: ["hero", "warum-foerdern", "spenden", "foerdermitglied", "transparenz"],
  },
  {
    id: "vorstellung",
    label: "Allgemeine Vorstellung",
    description:
      "Wer wir sind: Geschichte, Leitung, Repertoire und Eindrücke des Chors.",
    icon: Info,
    sections: ["hero", "ueber-uns", "leitung", "galerie", "kontakt"],
  },
];

export function getGoal(id: ChoirGoalId): ChoirGoal | undefined {
  return CHOIR_GOALS.find((g) => g.id === id);
}
