# PROJ-1: Onboarding-Formular für Animations-Briefings

## Status: In Progress
**Created:** 2026-06-14
**Last Updated:** 2026-06-14

## Summary
Eine öffentlich per Link teilbare Web-Formular-Seite, über die Kunden alle Informationen einreichen, die für die Produktion einer Supplement-Produktanimation benötigt werden. Das Formular ist in thematische Abschnitte gegliedert, validiert Eingaben (Zod), erlaubt Datei-Uploads (Produktfotos, Logo, Referenzen) nach Supabase Storage und speichert die Antworten in der Datenbank.

## Dependencies
- None (erstes Feature des Projekts)
- Voraussetzung: Supabase-Projekt mit Storage-Bucket und einer Tabelle für Einreichungen (wird in `/architecture` und `/backend` definiert)

## User Stories
- Als **Kunde** möchte ich ein geführtes, verständliches Formular ausfüllen, damit ich ohne Video-Fachwissen alle nötigen Infos zu meinem Produkt liefern kann.
- Als **Kunde** möchte ich Produktfotos, Logo und Referenzvideos hochladen können, damit der Produzent meine Markenwelt kennt.
- Als **Kunde** möchte ich angeben können, ob ich eine einzelne Animation oder eine ganze Kampagne brauche, damit der Umfang klar ist.
- Als **Kunde** möchte ich nach dem Absenden eine Bestätigung sehen, damit ich weiß, dass mein Briefing angekommen ist.
- Als **Produzent** möchte ich vollständige, strukturierte Briefings erhalten, damit ich ohne viele Rückfragen mit der Produktion starten kann.
- Als **Produzent** möchte ich, dass Pflichtfelder erzwungen werden, damit kein Briefing mit fehlenden Kerninfos ankommt.

## Formularinhalt (Felder)

### 1. Auftraggeber / Kontakt
- Firma / Marke *(Pflicht)*
- Ansprechpartner – Name *(Pflicht)*
- E-Mail *(Pflicht, valide E-Mail)*
- Telefon *(optional)*
- Website / Social-Media-Links *(optional, mehrfach)*

### 2. Produkt-Basics
- Produktname *(Pflicht)*
- Produktkategorie *(Pflicht, Auswahl: z. B. Vitamin/Mineral, Pre-Workout, Schlaf/Entspannung, Darmgesundheit, Protein, Beauty, Sonstiges)*
- Darreichungsform *(Pflicht, Auswahl: Kapsel, Tablette, Pulver, Liquid, Gummies, Sonstiges)*
- Kurzbeschreibung (1–2 Sätze) *(Pflicht)*

### 3. Wirkung & Inhaltsstoffe (Kern für die Animation)
- Hauptwirkstoffe / Inhaltsstoffe *(Pflicht)*
- Wirkmechanismus: Wie wirkt es im Körper? *(Pflicht, Freitext)*
- Wo im Körper passiert die Wirkung? *(Pflicht, z. B. Darm, Muskel, Gehirn, Blutbahn – Mehrfachauswahl + Freitext)*
- Die 3 wichtigsten Vorteile / Versprechen *(Pflicht)*
- Verbotene / zu vermeidende Health-Claims *(optional, Freitext – rechtlicher Hinweis)*

### 4. Zielgruppe & Tonalität
- Zielgruppe (Alter, Geschlecht, Lifestyle) *(Pflicht)*
- Welches Problem löst das Produkt für sie? *(Pflicht)*
- Gewünschte Tonalität *(Pflicht, Auswahl: seriös-medizinisch, sportlich-energetisch, natürlich-clean, premium-luxuriös, verspielt, Sonstiges)*

### 5. Umfang & Format
- Art des Auftrags *(Pflicht, Auswahl: Einzelne Video-Animation / Ganze Werbekampagne)*
- Gewünschte Länge *(Pflicht, z. B. 15s, 30s, 60s, Sonstiges)*
- Seitenverhältnis / Plattform *(Pflicht, Mehrfachauswahl: 9:16 Reels/TikTok, 1:1, 16:9 YouTube)*
- Voiceover / Sprecher gewünscht? *(Pflicht, Ja/Nein)*
- Text-Overlays gewünscht? *(optional, Ja/Nein)*
- Musik-Stil *(optional, Freitext)*
- Sprache(n) *(Pflicht)*

### 6. Visuals & Assets
- Produktfoto(s) *(Pflicht, Upload mehrerer Dateien, idealerweise freigestellt)*
- Logo *(optional, Upload – Vektor/PNG)*
- Brand-Farben *(optional, Freitext/Hex)*
- Brand-Schriften *(optional, Freitext)*
- Referenzvideos („so soll es aussehen") *(optional, Links und/oder Upload)*
- Vorhandene Markenrichtlinien *(optional, Upload)*

### 7. Rahmenbedingungen
- Wunsch-Deadline *(optional, Datum)*
- Budget-Rahmen *(optional, Auswahl oder Freitext)*
- Call-to-Action am Ende *(optional, Freitext: Website, Rabattcode, „Jetzt kaufen")*
- Sonstige Anmerkungen *(optional, Freitext)*

### Abschluss
- Datenschutz-Einwilligung (Checkbox) *(Pflicht – DSGVO)*

## Acceptance Criteria
- [ ] Das Formular ist als eigene Seite unter einer öffentlichen, teilbaren URL erreichbar (kein Login nötig).
- [ ] Das Formular ist in die 7 oben genannten Abschnitte gegliedert und auf Mobil (375px), Tablet (768px) und Desktop (1440px) bedienbar.
- [ ] Alle als *Pflicht* markierten Felder werden client- **und** serverseitig (Zod) validiert; das Absenden ist ohne sie nicht möglich.
- [ ] E-Mail-Feld akzeptiert nur valide E-Mail-Adressen.
- [ ] Produktfotos können hochgeladen werden (mind. 1 Pflicht, mehrere möglich); Uploads landen in Supabase Storage.
- [ ] Erlaubte Bildformate (z. B. JPG, PNG, WEBP) und eine Maximalgröße pro Datei werden geprüft; bei Verstoß erscheint eine klare Fehlermeldung.
- [ ] Nach erfolgreichem Absenden wird eine Bestätigungsansicht/-meldung angezeigt.
- [ ] Die Einreichung wird vollständig in der Datenbank gespeichert (inkl. Verweise auf hochgeladene Dateien) mit Zeitstempel.
- [ ] Die Datenschutz-Checkbox muss aktiviert sein, bevor abgesendet werden kann.
- [ ] Es gibt sichtbare Lade-, Fehler- und Erfolgszustände (kein „stiller" Absende-Vorgang).

## Edge Cases
- Was passiert, wenn der Upload während des Absendens fehlschlägt (Netzwerkabbruch)? → Klare Fehlermeldung, bereits eingegebene Formulardaten bleiben erhalten.
- Was passiert bei einer zu großen oder nicht erlaubten Datei? → Validierungsfehler vor dem Absenden, Datei wird abgelehnt.
- Was passiert, wenn der Nutzer das Formular doppelt absendet (Doppelklick)? → Submit-Button wird während des Sendens deaktiviert; keine doppelte Einreichung.
- Was passiert, wenn Pflichtfelder leer sind? → Feld-spezifische Fehlermeldungen, Scroll/Fokus zum ersten Fehler.
- Was passiert bei „Sonstiges"-Auswahlen? → Zusätzliches Freitextfeld erscheint.
- Was passiert, wenn der Nutzer offline ist? → Hinweis, dass keine Verbindung besteht; Eingaben gehen nicht verloren.
- Wie gehen wir mit Spam-Einreichungen um? → (Optional in MVP) einfacher Schutz wie Rate-Limiting / Honeypot-Feld.

## Technical Requirements
- **Frontend:** Next.js 16 App Router, shadcn/ui (form, input, textarea, select, radio-group, checkbox, button, card), react-hook-form + Zod-Resolver, Tailwind. Responsive & barrierearm (ARIA-Labels).
- **Backend/Storage:** Supabase Storage-Bucket für Uploads; Postgres-Tabelle `animation_briefings` für Antworten; RLS aktiviert; serverseitige Zod-Validierung im API-Route-Handler.
- **Security:** Datei-Typ- und Größenprüfung, Eingaben sanitisieren, keine Secrets im Client, neue Env-Vars in `.env.local.example` dokumentieren.
- **Performance:** Formular-Seite lädt < 2s; Upload mit Fortschrittsanzeige bei größeren Dateien.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick (in einem Satz)
Eine öffentlich erreichbare Formular-Seite nimmt das Briefing entgegen, lädt die Dateien sicher in den Supabase-Speicher hoch und speichert alle Antworten in einer Datenbank-Tabelle – ohne dass sich der Kunde einloggen muss.

### A) Seiten- & Komponentenstruktur
```
/briefing  (öffentliche Seite, ein Link zum Teilen)
+-- Kopfbereich (Titel + kurze Erklärung, was den Kunden erwartet)
+-- Briefing-Formular (ein Formular, in 7 Abschnitte gegliedert)
|   +-- Abschnitt 1: Auftraggeber / Kontakt
|   +-- Abschnitt 2: Produkt-Basics
|   +-- Abschnitt 3: Wirkung & Inhaltsstoffe
|   +-- Abschnitt 4: Zielgruppe & Tonalität
|   +-- Abschnitt 5: Umfang & Format
|   +-- Abschnitt 6: Visuals & Assets (mit Datei-Upload)
|   +-- Abschnitt 7: Rahmenbedingungen
|   +-- DSGVO-Einwilligung (Checkbox) + Absenden-Button
+-- Zustände: Laden / Fehler / Erfolg
+-- Bestätigungsansicht (nach erfolgreichem Absenden)

/briefing/danke  (Bestätigungsseite – „Briefing erhalten")
```
Hinweis: Alle Eingabe-Elemente kommen aus den bereits vorhandenen shadcn/ui-Bausteinen (Formular, Eingabefeld, Textfeld, Auswahl, Optionsfelder, Checkbox, Button, Karte, Fortschrittsanzeige, Benachrichtigung). Es werden **keine** UI-Grundbausteine neu gebaut – nur eine fachliche Zusammenstellung für dieses Formular.

### B) Datenmodell (in einfacher Sprache)
**Jedes eingereichte Briefing speichert:**
- Eine eindeutige ID und einen Eingangs-Zeitstempel
- *Kontakt:* Firma/Marke, Ansprechpartner, E-Mail, Telefon, Links
- *Produkt:* Produktname, Kategorie, Darreichungsform, Kurzbeschreibung
- *Wirkung:* Inhaltsstoffe, Wirkmechanismus, Wirkungsorte im Körper, Top-3-Vorteile, verbotene Health-Claims
- *Zielgruppe:* Beschreibung, gelöstes Problem, gewünschte Tonalität
- *Umfang:* Auftragsart (Einzelvideo/Kampagne), Länge, Seitenverhältnisse/Plattformen, Voiceover ja/nein, Text-Overlays, Musik-Stil, Sprache(n)
- *Visuals:* Verweise (Pfade) auf hochgeladene Produktfotos, Logo, Referenz-/Markenrichtlinien-Dateien, Brand-Farben, Brand-Schriften, Referenz-Links
- *Rahmen:* Deadline, Budget, Call-to-Action, Anmerkungen
- *Einwilligung:* DSGVO-Zustimmung (ja + Zeitpunkt)

**Wo wird gespeichert?**
- **Antworten (Text/Auswahl):** eine Datenbank-Tabelle `animation_briefings` in Supabase (Postgres).
- **Dateien (Fotos/Logo/Referenzen):** Supabase Storage-Bucket `briefing-uploads`. In der Tabelle stehen nur die Verweise (Pfade) auf die Dateien, nicht die Dateien selbst.

**Warum Datenbank statt Browser-Speicher?**
Die Briefings müssen dich (den Produzenten) erreichen und dauerhaft verfügbar sein – das geht nur server­seitig. Browser-Speicher (localStorage) würde nur auf dem Gerät des Kunden bleiben.

### C) Ablauf einer Einreichung (was wann passiert)
1. Kunde füllt das Formular aus; Eingaben werden direkt im Browser auf Vollständigkeit/Format geprüft (sofortiges Feedback).
2. Beim Absenden werden zuerst die Dateien in den Storage-Bucket hochgeladen (mit Fortschrittsanzeige), dann die Antworten gespeichert.
3. Die Antworten werden **zusätzlich auf dem Server erneut geprüft** (doppelte Sicherheit), bevor sie in die Datenbank geschrieben werden.
4. Bei Erfolg → Weiterleitung zur Bestätigungsseite. Bei Fehler → klare Meldung, eingegebene Daten bleiben erhalten.

### D) Zugriff & Sicherheit (einfach erklärt)
- Das Formular ist **öffentlich** (kein Login). Erlaubt ist daher nur **Einreichen** (Schreiben) – niemand kann über das Formular fremde Briefings lesen.
- Das **Lesen** der Briefings bleibt dir vorbehalten (über die geschützte Supabase-Verwaltung; eine Kunden-Leseansicht ist Non-Goal im MVP).
- Datei-Uploads werden auf **erlaubte Typen** (Bilder; bei Referenzen auch Dokumente) und **maximale Größe** begrenzt.
- Einfacher Spam-Schutz (verstecktes Honeypot-Feld) ist optional vorgesehen.
- Sicherheitszeile zur Datenbank: Row Level Security ist aktiv, sodass öffentliche Nutzer ausschließlich neue Einträge anlegen, aber nichts auslesen können.

### E) Technische Entscheidungen (kurz begründet)
- **Next.js App Router + Server-Route fürs Absenden:** trennt das öffentliche Formular sauber von der Speicher-Logik und erlaubt die serverseitige Nachprüfung.
- **shadcn/ui + react-hook-form + Zod:** vorhandener Standard im Projekt; ein Validierungsschema gilt sowohl im Browser als auch auf dem Server (eine Wahrheit, weniger Fehler).
- **Supabase Storage für Dateien, Postgres für Antworten:** Dateien gehören nicht in eine Datenbankzelle; Verweise verknüpfen beides sauber.

### F) Benötigte Pakete / Voraussetzungen
- `@supabase/supabase-js` – bereits installiert (Supabase-Client muss in `src/lib/supabase.ts` aktiviert werden).
- `react-hook-form` + `@hookform/resolvers` + `zod` – Formular & Validierung (prüfen/installieren).
- Neue Umgebungsvariablen: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (und serverseitiger Service-Key fürs geschützte Schreiben) – in `.env.local.example` zu dokumentieren.
- Supabase-Einrichtung (im `/backend`-Schritt): Tabelle `animation_briefings`, Storage-Bucket `briefing-uploads`, RLS-Policy „nur Einfügen für öffentliche Rolle".

### Offene Annahmen (bestätigt im Requirements-Schritt, hier festgehalten)
- Kein Login; Formular per öffentlichem Link.
- Mindestens 1 Produktfoto ist Pflicht.
- Auswahlwerte (Kategorien, Tonalitäten etc.) sind anpassbare Defaults.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
