import OpenAI from "openai";
import { CHOIR_GOALS, getGoal } from "./goals";
import type { ChoirGoalId, Recommendation, SectionSuggestion } from "./types";

export interface RecommendInput {
  goals: ChoirGoalId[];
  images: { url: string; alt: string }[];
}

const SECTION_TITLES: Record<string, string> = {
  hero: "Startbereich / Titelbild",
  mitsingen: "Mitsingen & Schnupperprobe",
  stimmgruppen: "Unsere Stimmgruppen",
  probenzeiten: "Probenzeiten & Ort",
  galerie: "Bildergalerie",
  kontakt: "Kontakt",
  termine: "Termine & Konzerte",
  "naechstes-konzert": "Nächstes Konzert",
  newsletter: "Newsletter / Erinnerung",
  repertoire: "Repertoire",
  anfrage: "Auftritt anfragen",
  referenzen: "Referenzen",
  "warum-foerdern": "Warum fördern?",
  spenden: "Spenden",
  foerdermitglied: "Fördermitglied werden",
  transparenz: "Mittelverwendung & Transparenz",
  "ueber-uns": "Über uns",
  leitung: "Chorleitung",
};

/**
 * Regelbasierte Empfehlung: aggregiert die Abschnitte der gewaehlten Ziele
 * (Reihenfolge bewahrt, dedupliziert) und verteilt die gefundenen Bilder grob
 * auf bildaffine Abschnitte. Dient als Fallback ohne OpenAI-Key.
 */
export function fallbackRecommendation(input: RecommendInput): Recommendation {
  const orderedSections: string[] = [];
  for (const goalId of input.goals) {
    const goal = getGoal(goalId);
    if (!goal) continue;
    for (const s of goal.sections) {
      if (!orderedSections.includes(s)) orderedSections.push(s);
    }
  }
  if (orderedSections.length === 0) orderedSections.push("hero", "galerie", "kontakt");

  const imageUrls = input.images.map((i) => i.url);
  const imageSections = new Set(["hero", "galerie", "naechstes-konzert", "referenzen"]);

  const sections: SectionSuggestion[] = orderedSections.map((type, idx) => {
    let imgs: string[] = [];
    if (type === "hero") {
      imgs = imageUrls.slice(0, 1);
    } else if (imageSections.has(type)) {
      imgs = imageUrls.slice(1, 9);
    }
    return {
      type,
      title: SECTION_TITLES[type] ?? type,
      rationale:
        idx === 0
          ? "Erster Eindruck – passend zum gewählten Schwerpunkt."
          : "Passt zum gewählten Ziel der Website.",
      imageUrls: imgs,
    };
  });

  return {
    goals: input.goals,
    source: "fallback",
    headline: buildHeadline(input.goals),
    sections,
  };
}

function buildHeadline(goals: ChoirGoalId[]): string {
  const labels = goals.map((g) => getGoal(g)?.label).filter(Boolean);
  if (labels.length === 0) return "Ihre neue Chor-Website";
  if (labels.length === 1) return `Schwerpunkt: ${labels[0]}`;
  return `Schwerpunkte: ${labels.join(", ")}`;
}

/**
 * KI-gestuetzte Empfehlung. Bei fehlendem Key oder Fehler faellt die Funktion
 * still auf {@link fallbackRecommendation} zurueck.
 */
export async function recommendStructure(input: RecommendInput): Promise<Recommendation> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackRecommendation(input);
  }

  const goalDescriptions = input.goals
    .map((g) => {
      const goal = getGoal(g);
      return goal ? `- ${goal.label}: ${goal.description}` : null;
    })
    .filter(Boolean)
    .join("\n");

  const allowedSections = Array.from(
    new Set(CHOIR_GOALS.flatMap((g) => g.sections)),
  ).join(", ");

  const imageList = input.images
    .slice(0, 30)
    .map((img, i) => `${i + 1}. ${img.url}${img.alt ? ` (alt: ${img.alt})` : ""}`)
    .join("\n");

  const systemPrompt = `Du bist Website-Konzepter:in für Amateur- und Vereinschöre.
Du planst die Struktur einer Chor-Website anhand der gewählten Ziele und der
verfügbaren Bilder. Antworte AUSSCHLIESSLICH als JSON in genau dieser Form:
{"headline": string, "sections": [{"type": string, "title": string, "rationale": string, "imageUrls": string[]}]}

Regeln:
- "type" MUSS aus dieser Liste stammen: ${allowedSections}.
- 4 bis 7 Abschnitte, sinnvoll für die gewählten Ziele geordnet (Startbereich zuerst).
- "imageUrls" nur aus der bereitgestellten Bilderliste wählen; bildlastige
  Abschnitte (hero, galerie) bekommen passende Bilder, Textabschnitte ggf. keine.
- "rationale": ein kurzer deutscher Satz.
- Keine Erklärungen außerhalb des JSON.`;

  const userPrompt = `Gewählte Ziele:\n${goalDescriptions}\n\nVerfügbare Bilder:\n${imageList || "(keine)"}`;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 900,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() ?? "{}";
    const parsed = JSON.parse(raw) as {
      headline?: string;
      sections?: SectionSuggestion[];
    };

    const validUrls = new Set(input.images.map((i) => i.url));
    const sections: SectionSuggestion[] = Array.isArray(parsed.sections)
      ? parsed.sections
          .filter((s) => s && typeof s.type === "string")
          .map((s) => ({
            type: s.type,
            title: s.title || SECTION_TITLES[s.type] || s.type,
            rationale: s.rationale || "Passt zum gewählten Ziel.",
            imageUrls: Array.isArray(s.imageUrls)
              ? s.imageUrls.filter((u) => validUrls.has(u))
              : [],
          }))
      : [];

    if (sections.length === 0) return fallbackRecommendation(input);

    return {
      goals: input.goals,
      source: "ai",
      headline: parsed.headline || buildHeadline(input.goals),
      sections,
    };
  } catch (err) {
    console.error("[recommend] OpenAI-Fehler, nutze Fallback:", err);
    return fallbackRecommendation(input);
  }
}
