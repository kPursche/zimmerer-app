import { NextRequest, NextResponse } from "next/server";
import { crawlPage, CrawlError } from "@/lib/crawler";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let url: string | undefined;
  try {
    ({ url } = await req.json());
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body." }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Keine URL angegeben." }, { status: 400 });
  }

  try {
    const result = await crawlPage(url);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CrawlError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[crawl] Unerwarteter Fehler:", err);
    return NextResponse.json({ error: "Crawlen fehlgeschlagen." }, { status: 500 });
  }
}
