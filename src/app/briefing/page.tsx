import type { Metadata } from "next"

import { BriefingForm } from "@/components/briefing-form"

export const metadata: Metadata = {
  title: "Animations-Briefing einreichen",
  description:
    "Reiche dein Produkt-Briefing für eine Supplement-Produktanimation ein – geführt, strukturiert und ohne Video-Fachwissen.",
}

export default function BriefingPage() {
  return (
    <main className="min-h-screen bg-muted/30 py-10">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <header className="mb-8 space-y-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Animations-Briefing
          </h1>
          <p className="text-muted-foreground">
            Fülle dieses Formular aus, damit wir deine Produktanimation präzise
            produzieren können. Es ist in 7 Abschnitte gegliedert und dauert
            etwa 10–15 Minuten. Mit{" "}
            <span className="text-destructive">*</span> markierte Felder sind
            Pflicht.
          </p>
        </header>

        <BriefingForm />
      </div>
    </main>
  )
}
