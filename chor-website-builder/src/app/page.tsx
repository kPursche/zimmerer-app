"use client";

import { ArrowLeft, ArrowRight, Loader2, Music4 } from "lucide-react";
import { useEffect, useState } from "react";
import { GoalPicker } from "@/components/goal-picker";
import { ImageEditor } from "@/components/image-editor";
import { ImageGallery } from "@/components/image-gallery";
import { RecommendationView } from "@/components/recommendation-view";
import { UrlForm } from "@/components/url-form";
import { cn } from "@/lib/utils";
import type {
  ChoirGoalId,
  CrawlResult,
  ExtractedImage,
  Recommendation,
} from "@/lib/types";

const STEPS = ["Website crawlen", "Bilder wählen & bearbeiten", "Ziel & Struktur"];

export default function Home() {
  const [step, setStep] = useState(0);

  const [crawl, setCrawl] = useState<CrawlResult | null>(null);
  const [crawlLoading, setCrawlLoading] = useState(false);
  const [crawlError, setCrawlError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<ExtractedImage | null>(null);
  const [bgAvailable, setBgAvailable] = useState(false);

  const [goals, setGoals] = useState<ChoirGoalId[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/process")
      .then((r) => r.json())
      .then((d) => setBgAvailable(Boolean(d?.backgroundRemoval)))
      .catch(() => setBgAvailable(false));
  }, []);

  async function handleCrawl(url: string) {
    setCrawlLoading(true);
    setCrawlError(null);
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Crawlen fehlgeschlagen.");
      setCrawl(data as CrawlResult);
      setSelected(new Set());
      setStep(1);
    } catch (err) {
      setCrawlError(err instanceof Error ? err.message : "Crawlen fehlgeschlagen.");
    } finally {
      setCrawlLoading(false);
    }
  }

  function toggleSelected(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  }

  function toggleGoal(id: ChoirGoalId) {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  }

  async function handleRecommend() {
    setRecLoading(true);
    setRecError(null);
    const images = (crawl?.images ?? [])
      .filter((i) => selected.has(i.url))
      .map((i) => ({ url: i.url, alt: i.alt }));
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals, images }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Empfehlung fehlgeschlagen.");
      setRecommendation(data as Recommendation);
    } catch (err) {
      setRecError(err instanceof Error ? err.message : "Empfehlung fehlgeschlagen.");
    } finally {
      setRecLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Music4 className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Chor-Website-Builder</h1>
          <p className="text-sm text-brand-500">
            Bestehende Website crawlen, Bilder aufbereiten, Ziel wählen.
          </p>
        </div>
      </header>

      {/* Stepper */}
      <ol className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                i === step
                  ? "bg-brand-600 text-white"
                  : i < step
                    ? "bg-brand-200 text-brand-700"
                    : "bg-brand-100 text-brand-400",
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-sm",
                i === step ? "font-semibold text-brand-900" : "text-brand-400",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="hidden h-px w-8 bg-brand-200 sm:block" />
            )}
          </li>
        ))}
      </ol>

      {/* Schritt 1: Crawlen */}
      {step === 0 && (
        <section className="space-y-4">
          <p className="text-brand-700">
            Gib die Adresse der bestehenden Chor-Website ein. Wir suchen automatisch
            alle Bilder heraus.
          </p>
          <UrlForm onCrawl={handleCrawl} loading={crawlLoading} />
          {crawlError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{crawlError}</p>
          )}
        </section>
      )}

      {/* Schritt 2: Galerie + Editor */}
      {step === 1 && crawl && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-brand-500">
              {crawl.images.length} Bilder gefunden auf{" "}
              <span className="font-medium text-brand-700">{crawl.title ?? crawl.pageUrl}</span> ·{" "}
              {selected.size} ausgewählt
            </p>
          </div>
          <ImageGallery
            images={crawl.images}
            selected={selected}
            onToggle={toggleSelected}
            onEdit={setEditing}
          />
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" /> Zurück
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={selected.size === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              Weiter <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* Schritt 3: Ziel + Empfehlung */}
      {step === 2 && (
        <section className="space-y-5">
          <p className="text-brand-700">
            Welches Ziel soll deine Chor-Website verfolgen? Mehrfachauswahl möglich.
          </p>
          <GoalPicker selected={goals} onToggle={toggleGoal} />

          {recError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{recError}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" /> Zurück
            </button>
            <button
              type="button"
              onClick={handleRecommend}
              disabled={goals.length === 0 || recLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {recLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Struktur vorschlagen
            </button>
          </div>

          {recommendation && <RecommendationView recommendation={recommendation} />}
        </section>
      )}

      {editing && (
        <ImageEditor
          image={editing}
          backgroundRemovalAvailable={bgAvailable}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}
