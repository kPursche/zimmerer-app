"use client";

import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtractedImage } from "@/lib/types";

export function ImageGallery({
  images,
  selected,
  onToggle,
  onEdit,
}: {
  images: ExtractedImage[];
  selected: Set<string>;
  onToggle: (url: string) => void;
  onEdit: (image: ExtractedImage) => void;
}) {
  if (images.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-brand-200 bg-white/60 p-6 text-center text-brand-500">
        Auf dieser Seite wurden keine Bilder gefunden.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img) => {
        const isSelected = selected.has(img.url);
        return (
          <div
            key={img.url}
            className={cn(
              "group relative overflow-hidden rounded-lg border bg-white shadow-sm transition",
              isSelected ? "border-brand-500 ring-2 ring-brand-300" : "border-brand-200",
            )}
          >
            <button
              type="button"
              onClick={() => onToggle(img.url)}
              className="block w-full"
              title={img.alt || img.url}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || "Gefundenes Bild"}
                loading="lazy"
                className="aspect-square w-full bg-brand-100 object-cover"
              />
              <span
                className={cn(
                  "absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-white transition",
                  isSelected
                    ? "border-brand-600 bg-brand-600"
                    : "border-white bg-black/30 opacity-0 group-hover:opacity-100",
                )}
              >
                {isSelected && <Check className="h-4 w-4" />}
              </span>
            </button>

            <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs text-brand-500">
              <span className="truncate" title={img.alt || img.url}>
                {img.alt || hostnameOf(img.url)}
              </span>
              <button
                type="button"
                onClick={() => onEdit(img)}
                className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-1 font-medium text-brand-600 hover:bg-brand-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Bearbeiten
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).pathname.split("/").pop() || new URL(url).hostname;
  } catch {
    return url;
  }
}
