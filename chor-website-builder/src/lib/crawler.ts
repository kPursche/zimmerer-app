import * as cheerio from "cheerio";
import type { CrawlResult, ExtractedImage, ImageSource } from "./types";

const USER_AGENT =
  "ChorWebsiteBuilder/0.1 (+https://github.com/kPursche/chor-website-builder)";

const MAX_HTML_BYTES = 5 * 1024 * 1024; // 5 MB
const FETCH_TIMEOUT_MS = 12_000;

/**
 * Validiert eine vom Nutzer eingegebene URL und schuetzt grob vor SSRF, indem
 * offensichtlich interne Ziele abgelehnt werden. Hinweis: Schutz gegen
 * DNS-Rebinding ist hier bewusst nicht enthalten (siehe README).
 */
export function assertSafeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new CrawlError("Bitte eine vollständige URL eingeben (inkl. https://).", 400);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new CrawlError("Nur http:// und https:// werden unterstützt.", 400);
  }

  const host = url.hostname.toLowerCase();
  const blockedExact = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
  const isPrivate =
    blockedExact.includes(host) ||
    host.endsWith(".local") ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);

  if (isPrivate) {
    throw new CrawlError("Interne bzw. lokale Adressen sind nicht erlaubt.", 400);
  }

  return url;
}

export class CrawlError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "CrawlError";
  }
}

/** Waehlt aus einem srcset-Attribut die URL mit der hoechsten Aufloesung. */
function pickFromSrcset(srcset: string, base: URL): string | null {
  const candidates = srcset
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [u, descriptor] = part.split(/\s+/, 2);
      // Descriptor ist z.B. "1024w" oder "2x" – groesserer Wert = bevorzugt.
      const weight = descriptor ? parseFloat(descriptor) || 0 : 0;
      return { u, weight };
    });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.weight - a.weight);
  return resolve(candidates[0].u, base);
}

function resolve(src: string | undefined, base: URL): string | null {
  if (!src) return null;
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith("data:")) return null;
  try {
    return new URL(trimmed, base).toString();
  } catch {
    return null;
  }
}

/** Extrahiert die url(...) aus einem background-image / background CSS-Wert. */
function backgroundUrls(style: string, base: URL): string[] {
  const out: string[] = [];
  const re = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(style)) !== null) {
    const resolved = resolve(m[1], base);
    if (resolved) out.push(resolved);
  }
  return out;
}

function toInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Laedt eine Seite und extrahiert alle gefundenen Bilder (img, srcset, picture,
 * CSS-Hintergruende, og:image, link rel=image_src). Ergebnis ist dedupliziert.
 */
export async function crawlPage(rawUrl: string): Promise<CrawlResult> {
  const url = assertSafeUrl(rawUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
      redirect: "follow",
      signal: controller.signal,
    });
  } catch (err) {
    throw new CrawlError(
      err instanceof Error && err.name === "AbortError"
        ? "Zeitüberschreitung beim Laden der Seite."
        : "Die Seite konnte nicht geladen werden.",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new CrawlError(`Die Seite antwortete mit Status ${res.status}.`, 502);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("html")) {
    throw new CrawlError("Die URL liefert kein HTML-Dokument.", 415);
  }

  const html = await readLimited(res, MAX_HTML_BYTES);
  const base = new URL(res.url || url.toString());
  const $ = cheerio.load(html);

  // Map url -> ExtractedImage, damit Duplikate zusammengefasst werden.
  const found = new Map<string, ExtractedImage>();

  const add = (
    rawSrc: string | null,
    source: ImageSource,
    alt = "",
    width: number | null = null,
    height: number | null = null,
  ) => {
    if (!rawSrc) return;
    const existing = found.get(rawSrc);
    if (existing) {
      // Vorhandenen Eintrag mit besseren Metadaten anreichern.
      if (!existing.alt && alt) existing.alt = alt;
      if (existing.width == null && width != null) existing.width = width;
      if (existing.height == null && height != null) existing.height = height;
      return;
    }
    found.set(rawSrc, { url: rawSrc, alt, source, width, height });
  };

  $("img").each((_, el) => {
    const $el = $(el);
    const alt = $el.attr("alt")?.trim() ?? "";
    const width = toInt($el.attr("width"));
    const height = toInt($el.attr("height"));
    const srcset = $el.attr("srcset");
    if (srcset) {
      add(pickFromSrcset(srcset, base), "srcset", alt, width, height);
    }
    add(resolve($el.attr("src") ?? $el.attr("data-src"), base), "img", alt, width, height);
  });

  $("picture source").each((_, el) => {
    const srcset = $(el).attr("srcset");
    if (srcset) add(pickFromSrcset(srcset, base), "picture");
  });

  $("[style]").each((_, el) => {
    const style = $(el).attr("style");
    if (style && /background/i.test(style)) {
      for (const u of backgroundUrls(style, base)) add(u, "background");
    }
  });

  $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
    add(resolve($(el).attr("content"), base), "og");
  });

  $('link[rel="image_src"]').each((_, el) => {
    add(resolve($(el).attr("href"), base), "link");
  });

  return {
    pageUrl: base.toString(),
    title: $("title").first().text().trim() || null,
    images: Array.from(found.values()),
  };
}

/** Liest einen Response-Body bis zu einem Byte-Limit und bricht danach ab. */
async function readLimited(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return res.text();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.length;
      if (total > maxBytes) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
  }
  return new TextDecoder("utf-8").decode(concat(chunks));
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}
