"use client";

import { Download, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { useState } from "react";
import { formatBytes } from "@/lib/utils";
import type { ExtractedImage, FilterName, ProcessOps, ProcessResult } from "@/lib/types";

const FILTERS: { value: FilterName; label: string }[] = [
  { value: "none", label: "Kein Filter" },
  { value: "grayscale", label: "Schwarz-Weiß" },
  { value: "sepia", label: "Sepia" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Kühl" },
  { value: "high-contrast", label: "Mehr Kontrast" },
  { value: "soft", label: "Weich" },
];

export function ImageEditor({
  image,
  backgroundRemovalAvailable,
  onClose,
}: {
  image: ExtractedImage;
  backgroundRemovalAvailable: boolean;
  onClose: () => void;
}) {
  const [width, setWidth] = useState<number | "">(image.width ?? 1200);
  const [filter, setFilter] = useState<FilterName>("none");
  const [removeBg, setRemoveBg] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [transparent, setTransparent] = useState(true);
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");

  const [result, setResult] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    setLoading(true);
    setError(null);
    const ops: ProcessOps = {
      resize: width ? { width: Number(width), fit: "inside" } : undefined,
      filter,
      removeBackground: removeBg,
      backgroundColor: removeBg && !transparent ? bgColor : null,
      format: removeBg && transparent ? "png" : format,
    };
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: image.url, ops }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verarbeitung fehlgeschlagen.");
      setResult(data as ProcessResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verarbeitung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-900">
            <Wand2 className="h-5 w-5 text-brand-500" />
            Bild bearbeiten
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-brand-400 hover:bg-brand-50 hover:text-brand-700"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-2">
          {/* Vorschau */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-brand-100 bg-[conic-gradient(#eee_90deg,#fff_90deg_180deg,#eee_180deg_270deg,#fff_270deg)] bg-[length:20px_20px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result?.dataUrl ?? image.url}
                alt={image.alt || "Vorschau"}
                className="mx-auto max-h-[360px] w-full object-contain"
              />
            </div>
            {result && (
              <div className="flex items-center justify-between text-sm text-brand-500">
                <span>
                  {result.width}×{result.height} px · {formatBytes(result.bytes)} ·{" "}
                  {result.format.toUpperCase()}
                </span>
                <a
                  href={result.dataUrl}
                  download={`chorbild.${result.format === "jpeg" ? "jpg" : result.format}`}
                  className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
                >
                  <Download className="h-4 w-4" />
                  Herunterladen
                </a>
              </div>
            )}
          </div>

          {/* Steuerung */}
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-700">Breite (px)</span>
              <input
                type="number"
                min={50}
                max={4000}
                value={width}
                onChange={(e) => setWidth(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-lg border border-brand-200 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <span className="mt-1 block text-xs text-brand-400">
                Höhe wird proportional angepasst. Wird nie vergrößert.
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-700">Filter</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterName)}
                className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                {FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-700">Format</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as "jpeg" | "png" | "webp")}
                disabled={removeBg && transparent}
                className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-50"
              >
                <option value="jpeg">JPEG (kleiner)</option>
                <option value="webp">WebP (modern)</option>
                <option value="png">PNG (verlustfrei)</option>
              </select>
            </label>

            <div className="rounded-lg border border-brand-100 bg-brand-50/50 p-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={removeBg}
                  disabled={!backgroundRemovalAvailable}
                  onChange={(e) => setRemoveBg(e.target.checked)}
                  className="h-4 w-4 accent-brand-600"
                />
                <span className="flex items-center gap-1 text-sm font-medium text-brand-700">
                  <Sparkles className="h-4 w-4 text-brand-500" />
                  Hintergrund per KI entfernen
                </span>
              </label>
              {!backgroundRemovalAvailable && (
                <p className="mt-1 text-xs text-brand-400">
                  Nicht konfiguriert – REMOVE_BG_API_KEY in .env.local setzen.
                </p>
              )}
              {removeBg && (
                <div className="mt-3 space-y-2 pl-6">
                  <label className="flex items-center gap-2 text-sm text-brand-700">
                    <input
                      type="checkbox"
                      checked={transparent}
                      onChange={(e) => setTransparent(e.target.checked)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    Transparenter Hintergrund (PNG)
                  </label>
                  {!transparent && (
                    <label className="flex items-center gap-2 text-sm text-brand-700">
                      Hintergrundfarbe
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-7 w-10 cursor-pointer rounded border border-brand-200"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="button"
              onClick={apply}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              Anwenden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
