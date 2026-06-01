import { NextRequest, NextResponse } from "next/server";
import { recommendStructure } from "@/lib/recommend";
import { CHOIR_GOALS } from "@/lib/goals";
import type { ChoirGoalId } from "@/lib/types";

export const runtime = "nodejs";

const VALID_GOALS = new Set<ChoirGoalId>(CHOIR_GOALS.map((g) => g.id));

export async function POST(req: NextRequest) {
  let body: {
    goals?: ChoirGoalId[];
    images?: { url?: string; alt?: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body." }, { status: 400 });
  }

  const goals = Array.isArray(body.goals)
    ? body.goals.filter((g): g is ChoirGoalId => VALID_GOALS.has(g))
    : [];
  if (goals.length === 0) {
    return NextResponse.json({ error: "Bitte mindestens ein Ziel wählen." }, { status: 400 });
  }

  const images = Array.isArray(body.images)
    ? body.images
        .filter((i) => i && typeof i.url === "string")
        .map((i) => ({ url: i.url as string, alt: i.alt ?? "" }))
    : [];

  try {
    const recommendation = await recommendStructure({ goals, images });
    return NextResponse.json(recommendation);
  } catch (err) {
    console.error("[recommend] Unerwarteter Fehler:", err);
    return NextResponse.json({ error: "Empfehlung fehlgeschlagen." }, { status: 500 });
  }
}
