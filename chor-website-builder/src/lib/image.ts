import sharp from "sharp";
import { removeBackground } from "./background";
import { assertSafeUrl } from "./crawler";
import type { FilterName, ProcessOps, ProcessResult } from "./types";

const USER_AGENT =
  "ChorWebsiteBuilder/0.1 (+https://github.com/kPursche/chor-website-builder)";
const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20 MB
const FETCH_TIMEOUT_MS = 15_000;

export class ImageError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "ImageError";
  }
}

/** Laedt ein Bild von einer (geprueften) URL als Buffer. */
export async function fetchImageBuffer(rawUrl: string): Promise<Buffer> {
  const url = assertSafeUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
      redirect: "follow",
      signal: controller.signal,
    });
  } catch (err) {
    throw new ImageError(
      err instanceof Error && err.name === "AbortError"
        ? "Zeitüberschreitung beim Laden des Bildes."
        : "Das Bild konnte nicht geladen werden.",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) throw new ImageError(`Das Bild antwortete mit Status ${res.status}.`);

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > MAX_IMAGE_BYTES) {
    throw new ImageError("Das Bild ist zu groß (max. 20 MB).", 413);
  }
  return buf;
}

/** Wendet einen benannten Filter auf eine sharp-Pipeline an. */
function applyFilter(img: sharp.Sharp, filter: FilterName | undefined): sharp.Sharp {
  switch (filter) {
    case "grayscale":
      return img.grayscale();
    case "sepia":
      return img.grayscale().tint({ r: 112, g: 66, b: 20 });
    case "warm":
      return img.modulate({ brightness: 1.03, saturation: 1.12, hue: -10 });
    case "cool":
      return img.modulate({ brightness: 1.0, saturation: 1.08, hue: 12 });
    case "high-contrast":
      // a*x + b mit a=1.25, b so gewaehlt, dass um Mittelwert 128 kontrastiert wird.
      return img.linear(1.25, -(128 * 0.25));
    case "soft":
      return img.blur(1.2).modulate({ brightness: 1.03 });
    case "none":
    case undefined:
    default:
      return img;
  }
}

/**
 * Wendet die angeforderten Operationen serverseitig via sharp an. Reihenfolge:
 * Hintergrund entfernen -> zuschneiden -> skalieren -> filtern -> Ausgabeformat.
 */
export async function processImage(
  input: Buffer,
  ops: ProcessOps,
): Promise<ProcessResult> {
  let working = input;

  if (ops.removeBackground) {
    working = await removeBackground(working, ops.backgroundColor ?? null);
  }

  let img = sharp(working, { failOn: "none" }).rotate(); // EXIF-Orientierung beachten

  if (ops.crop) {
    const { left, top, width, height } = ops.crop;
    if (width > 0 && height > 0) {
      img = img.extract({
        left: Math.max(0, Math.round(left)),
        top: Math.max(0, Math.round(top)),
        width: Math.round(width),
        height: Math.round(height),
      });
    }
  }

  if (ops.resize && (ops.resize.width || ops.resize.height)) {
    img = img.resize({
      width: ops.resize.width,
      height: ops.resize.height,
      fit: ops.resize.fit ?? "inside",
      withoutEnlargement: true,
    });
  }

  img = applyFilter(img, ops.filter);

  const format = ops.format ?? "jpeg";
  if (format === "png") img = img.png();
  else if (format === "webp") img = img.webp({ quality: ops.quality ?? 82 });
  else img = img.jpeg({ quality: ops.quality ?? 82, mozjpeg: true });

  const { data, info } = await img.toBuffer({ resolveWithObject: true });
  const contentType = `image/${format === "jpeg" ? "jpeg" : format}`;

  return {
    dataUrl: `data:${contentType};base64,${data.toString("base64")}`,
    width: info.width,
    height: info.height,
    bytes: data.byteLength,
    format,
  };
}
