# Chor-Website-Builder

Ein Werkzeug, das aus einer **bestehenden Chor-Website** automatisch die Bilder
herausholt, sie aufbereitet (Größe, Zuschnitt, Filter, KI-Hintergrund) und auf
Basis eines gewählten **Ziels** eine Website-Struktur vorschlägt.

> Eigenständige Next.js-App. Liegt derzeit als Unterverzeichnis im Repo
> `zimmerer-app`, weil die Build-Umgebung kein neues Repository anlegen darf.
> Der Ordner ist in sich geschlossen (eigene `package.json`) und lässt sich
> jederzeit 1:1 in ein eigenes Repository verschieben.

## Status & Roadmap

**Phase 1 (umgesetzt):**
- Website crawlen und Bilder extrahieren (`<img>`, `srcset`, `<picture>`,
  CSS-Hintergründe, `og:image`, `link[rel=image_src]`).
- Bilder serverseitig mit **sharp** bearbeiten: skalieren, zuschneiden, Filter
  (S/W, Sepia, warm, kühl, Kontrast, weich), Ausgabeformat (JPEG/WebP/PNG).
- **KI-Hintergrundentfernung** über remove.bg (optional), inkl. transparentem
  oder einfarbigem Ersatzhintergrund.
- **Ziel-Auswahl** (5 Chor-Ziele) und daraus ein Struktur-Vorschlag – KI-gestützt
  (OpenAI) mit regelbasiertem Fallback.

**Phase 2 (geplant):**
- Aus Struktur-Vorschlag + aufbereiteten Bildern eine echte, vorschaubare und
  exportierbare Website generieren.

## Setup

```bash
cd chor-website-builder
npm install
cp .env.local.example .env.local   # optionale Keys eintragen
npm run dev                          # http://localhost:3000
```

### Umgebungsvariablen (beide optional)

| Variable             | Zweck                                                        | Ohne Key                          |
| -------------------- | ------------------------------------------------------------ | --------------------------------- |
| `OPENAI_API_KEY`     | KI-gestützter Struktur-Vorschlag im Schritt „Ziel“           | regelbasierter Fallback           |
| `REMOVE_BG_API_KEY`  | KI-Hintergrundentfernung im Bild-Editor (remove.bg)          | Funktion ist im UI deaktiviert    |

## Architektur

```
src/
  app/
    page.tsx                 3-Schritt-Workflow (Client)
    layout.tsx, globals.css
    api/
      crawl/route.ts         POST  -> Bilder einer Seite extrahieren
      process/route.ts       POST  -> Bild bearbeiten · GET -> Feature-Flags
      recommend/route.ts     POST  -> Website-Struktur vorschlagen
  lib/
    types.ts                 gemeinsame Typen
    goals.ts                 die 5 Chor-Ziele + zugehörige Abschnitte
    crawler.ts               HTML laden + Bild-Extraktion (cheerio) + SSRF-Guard
    image.ts                 sharp-Pipeline (resize/crop/filter/format)
    background.ts            KI-Hintergrund (remove.bg, gekapselter Provider)
    recommend.ts             KI- + regelbasierte Struktur-Empfehlung
    utils.ts
  components/                UrlForm, ImageGallery, ImageEditor, GoalPicker, …
```

Alle API-Routes laufen in der Node-Runtime (`runtime = "nodejs"`), da `sharp`
nicht in der Edge-Runtime läuft.

## Sicherheitshinweise

- Der Crawler akzeptiert nur `http`/`https` und blockt offensichtlich interne
  Ziele (localhost, private IP-Bereiche, `.local`). **DNS-Rebinding ist damit
  nicht abgedeckt** – für einen öffentlichen Betrieb sollte zusätzlich die
  aufgelöste IP geprüft und ein Allowlist-/Proxy-Ansatz erwogen werden.
- Antwort-Größen sind begrenzt (HTML 5 MB, Bild 20 MB) und Requests haben ein
  Timeout.
- Bitte nur Websites crawlen, für die eine Berechtigung besteht, und `robots.txt`
  sowie Urheberrechte an den Bildern beachten.
