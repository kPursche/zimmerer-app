"use client";

import { Sparkles } from "lucide-react";
import type { Recommendation } from "@/lib/types";

export function RecommendationView({ recommendation }: { recommendation: Recommendation }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-brand-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm text-brand-500">
          <Sparkles className="h-4 w-4" />
          {recommendation.source === "ai"
            ? "KI-Vorschlag für deine Website-Struktur"
            : "Vorgeschlagene Website-Struktur (regelbasiert)"}
        </div>
        <h3 className="mt-1 text-xl font-bold text-brand-900">{recommendation.headline}</h3>
      </div>

      <ol className="space-y-3">
        {recommendation.sections.map((section, idx) => (
          <li
            key={`${section.type}-${idx}`}
            className="rounded-xl border border-brand-200 bg-white p-4"
          >
            <div className="flex items-baseline gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-brand-900">{section.title}</h4>
                <p className="text-sm text-brand-500">{section.rationale}</p>
                {section.imageUrls.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {section.imageUrls.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={url}
                        src={url}
                        alt=""
                        loading="lazy"
                        className="h-16 w-16 rounded-md border border-brand-100 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="rounded-lg border border-dashed border-brand-200 bg-brand-50/50 p-4 text-sm text-brand-500">
        Nächster Schritt (Phase 2): Aus dieser Struktur und den aufbereiteten Bildern
        wird eine echte, vorschaubare Website generiert.
      </p>
    </div>
  );
}
