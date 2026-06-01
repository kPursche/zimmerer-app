import sharp from "sharp";

/** Geworfen, wenn die Hintergrundentfernung nicht konfiguriert ist. */
export class BackgroundError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "BackgroundError";
  }
}

export function isBackgroundRemovalConfigured(): boolean {
  return Boolean(process.env.REMOVE_BG_API_KEY);
}

/**
 * Entfernt den Hintergrund eines Bildes per remove.bg-API und liefert ein PNG
 * mit Transparenz. Ist `backgroundColor` gesetzt, wird das freigestellte Motiv
 * anschliessend auf diese Flaeche komponiert.
 *
 * Die KI-Hintergrundentfernung ist bewusst hinter einem Provider gekapselt –
 * so laesst sich remove.bg spaeter durch einen anderen Dienst ersetzen.
 */
export async function removeBackground(
  input: Buffer,
  backgroundColor: string | null,
): Promise<Buffer> {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    throw new BackgroundError(
      "Hintergrundentfernung ist nicht konfiguriert (REMOVE_BG_API_KEY fehlt).",
      501,
    );
  }

  const form = new FormData();
  form.append("image_file", new Blob([new Uint8Array(input)]), "image");
  form.append("size", "auto");

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new BackgroundError(
      `Hintergrundentfernung fehlgeschlagen (Status ${res.status}). ${detail.slice(0, 200)}`,
    );
  }

  const cutout = Buffer.from(await res.arrayBuffer());
  if (!backgroundColor) return cutout;

  // Freigestelltes Motiv auf eine einfarbige Flaeche legen.
  return sharp(cutout)
    .flatten({ background: backgroundColor })
    .png()
    .toBuffer();
}
