# Product Requirements Document

## Vision
Eine schlanke Web-Plattform, über die Interessenten und Kunden strukturierte Produktions-Briefings für Produkt­animationen einreichen. Ziel ist es, in einem einzigen, teilbaren Onboarding-Formular alle Informationen zu erfassen, die für die Erstellung einer Animation (Produktion mit Higgsfield + Claude Code) nötig sind – damit weniger Rückfragen entstehen und die Produktion schneller und präziser starten kann.

## Target Users
- **Kunden / Interessenten (Auftraggeber):** Supplement-Marken und Produktanbieter, die eine Werbe- oder Erklär-Animation für ihr Produkt benötigen. Sie sind keine Video-Profis und brauchen eine geführte, verständliche Eingabe.
- **Produzent (Betreiber):** Erstellt die Animationen. Braucht vollständige, sortierte Briefings inkl. Assets (Produktfotos, Logo), um direkt mit der Produktion zu starten.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | PROJ-1: Onboarding-Formular für Animations-Briefings | Planned |
| P1 | Admin-Übersicht der eingereichten Briefings | Planned |
| P2 | Automatische E-Mail-Benachrichtigung bei neuer Einreichung | Planned |

## Success Metrics
- Anteil vollständig ausgefüllter Briefings (Ziel: > 90 % der Pflichtfelder ohne Rückfrage nutzbar)
- Reduktion der Rückfrage-Runden pro Auftrag
- Zeit von Anfrage bis Produktionsstart
- Conversion: begonnene vs. abgeschickte Formulare

## Constraints
- Tech-Stack: Next.js 16 (App Router), TypeScript, Tailwind + shadcn/ui, Supabase (Storage für Uploads, Postgres für Antworten), Zod-Validierung
- Einzelperson / kleines Team – Lösung muss wartungsarm sein
- DSGVO-konform (personenbezogene Kontaktdaten werden erfasst)

## Non-Goals
- Kein Login/Account für Kunden in der MVP-Version (Formular ist per öffentlichem Link erreichbar)
- Keine Bezahlfunktion / kein Vertragsabschluss im Formular
- Keine Erstellung der Animation selbst (separater Produktionsprozess)
- Kein mehrstufiger Freigabe-Workflow im MVP

---

Use `/requirements` to create detailed feature specifications for each item in the roadmap above.
