import { NextRequest, NextResponse } from "next/server";
import { fetchImageBuffer, processImage, ImageError } from "@/lib/image";
import { BackgroundError, isBackgroundRemovalConfigured } from "@/lib/background";
import { CrawlError } from "@/lib/crawler";
import type { ProcessOps } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  // Erlaubt dem UI, Funktionen abhaengig von der Konfiguration anzuzeigen.
  return NextResponse.json({
    backgroundRemoval: isBackgroundRemovalConfigured(),
  });
}

export async function POST(req: NextRequest) {
  let body: { imageUrl?: string; ops?: ProcessOps };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body." }, { status: 400 });
  }

  const { imageUrl, ops } = body;
  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "Keine Bild-URL angegeben." }, { status: 400 });
  }

  try {
    const buffer = await fetchImageBuffer(imageUrl);
    const result = await processImage(buffer, ops ?? {});
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackgroundError || err instanceof ImageError || err instanceof CrawlError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[process] Unerwarteter Fehler:", err);
    return NextResponse.json({ error: "Bildverarbeitung fehlgeschlagen." }, { status: 500 });
  }
}
