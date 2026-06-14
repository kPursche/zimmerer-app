"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Trash2, Upload, X, WifiOff } from "lucide-react"
import { toast } from "sonner"

import {
  briefingSchema,
  type BriefingFormValues,
  PRODUKTKATEGORIEN,
  DARREICHUNGSFORMEN,
  TONALITAETEN,
  AUFTRAGSARTEN,
  LAENGEN,
  SEITENVERHAELTNISSE,
  WIRKUNGSORTE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_LABEL,
  MAX_FILE_SIZE,
} from "@/lib/briefing-schema"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// --- Hilfs-Subkomponente: Abschnitts-Karte ---

interface SectionProps {
  step: number
  title: string
  description?: string
  children: React.ReactNode
}

function Section({ step, title, description, children }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {step}
          </span>
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  )
}

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {" "}
      *
    </span>
  )
}

// --- Datei-Liste Typ für manuell verwaltete Uploads ---
type ManagedFiles = File[]

const DEFAULT_VALUES: Partial<BriefingFormValues> = {
  firma: "",
  ansprechpartner: "",
  email: "",
  telefon: "",
  links: [{ url: "" }],
  produktname: "",
  produktkategorieSonstiges: "",
  darreichungsformSonstiges: "",
  kurzbeschreibung: "",
  inhaltsstoffe: "",
  wirkmechanismus: "",
  wirkungsorte: [],
  wirkungsorteFreitext: "",
  vorteile: "",
  verboteneClaims: "",
  zielgruppe: "",
  geloestesProblem: "",
  tonalitaetSonstiges: "",
  laengeSonstiges: "",
  seitenverhaeltnisse: [],
  textOverlays: "nein",
  musikStil: "",
  sprachen: "",
  brandFarben: "",
  brandSchriften: "",
  referenzLinks: [{ url: "" }],
  deadline: "",
  budget: "",
  callToAction: "",
  anmerkungen: "",
  datenschutz: false as unknown as true,
  website_hp: "",
}

export function BriefingForm() {
  const router = useRouter()

  const form = useForm<BriefingFormValues>({
    resolver: zodResolver(briefingSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
  })

  const linksArray = useFieldArray({ control: form.control, name: "links" })
  const refLinksArray = useFieldArray({
    control: form.control,
    name: "referenzLinks",
  })

  // Manuell verwaltete Datei-Uploads (außerhalb von react-hook-form, da File-Objekte)
  const [produktfotos, setProduktfotos] = React.useState<ManagedFiles>([])
  const [logo, setLogo] = React.useState<File | null>(null)
  const [referenzDateien, setReferenzDateien] = React.useState<ManagedFiles>([])
  const [markenrichtlinien, setMarkenrichtlinien] = React.useState<File | null>(
    null,
  )
  const [fotoFehler, setFotoFehler] = React.useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isOffline, setIsOffline] = React.useState(false)

  // Online/Offline-Status beobachten
  React.useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine)
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  // Watch der "Sonstiges"-Felder für bedingte Freitexte
  const kategorie = form.watch("produktkategorie")
  const darreichung = form.watch("darreichungsform")
  const tonalitaet = form.watch("tonalitaet")
  const laenge = form.watch("laenge")

  // --- Datei-Handling mit Validierung ---

  function validateImages(files: File[]): { ok: File[]; error: string | null } {
    const ok: File[] = []
    for (const file of files) {
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
        )
      ) {
        return {
          ok,
          error: `"${file.name}": Nicht erlaubtes Format. Erlaubt: ${ALLOWED_IMAGE_LABEL}.`,
        }
      }
      if (file.size > MAX_FILE_SIZE) {
        return {
          ok,
          error: `"${file.name}": Datei ist zu groß (max. ${MAX_FILE_SIZE / (1024 * 1024)} MB).`,
        }
      }
      ok.push(file)
    }
    return { ok, error: null }
  }

  function handleProduktfotos(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? [])
    const { ok, error } = validateImages(incoming)
    if (error) {
      setFotoFehler(error)
    } else {
      setFotoFehler(null)
    }
    setProduktfotos((prev) => [...prev, ...ok])
    e.target.value = "" // erlaubt erneutes Auswählen derselben Datei
  }

  function removeProduktfoto(index: number) {
    setProduktfotos((prev) => prev.filter((_, i) => i !== index))
  }

  function handleReferenzDateien(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? [])
    const tooBig = incoming.find((f) => f.size > MAX_FILE_SIZE)
    if (tooBig) {
      toast.error(`"${tooBig.name}" ist zu groß (max. 10 MB).`)
      e.target.value = ""
      return
    }
    setReferenzDateien((prev) => [...prev, ...incoming])
    e.target.value = ""
  }

  function removeReferenzDatei(index: number) {
    setReferenzDateien((prev) => prev.filter((_, i) => i !== index))
  }

  // --- Absenden (Platzhalter – echte Supabase-Speicherung folgt in /backend) ---

  async function onSubmit(values: BriefingFormValues) {
    setSubmitError(null)
    setFotoFehler(null)

    if (isOffline) {
      setSubmitError(
        "Keine Internetverbindung. Deine Eingaben bleiben erhalten – bitte erneut absenden, sobald du wieder online bist.",
      )
      return
    }

    // Mindestens 1 Produktfoto ist Pflicht
    if (produktfotos.length === 0) {
      setFotoFehler("Bitte lade mindestens ein Produktfoto hoch (Pflicht).")
      document
        .getElementById("section-visuals")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }

    setIsSubmitting(true)
    setProgress(0)

    try {
      // PLATZHALTER: Simulierter Upload-/Speichervorgang mit Fortschrittsanzeige.
      // Wird im /backend-Schritt durch echten Supabase-Storage-Upload + DB-Insert ersetzt.
      const totalSteps = produktfotos.length + referenzDateien.length + 2
      for (let i = 1; i <= totalSteps; i++) {
        await new Promise((r) => setTimeout(r, 250))
        setProgress(Math.round((i / totalSteps) * 100))
      }

      // Für spätere Backend-Integration bereits zusammengestelltes Payload (Debug).
      const payload = {
        ...values,
        produktfotos: produktfotos.map((f) => f.name),
        logo: logo?.name ?? null,
        referenzDateien: referenzDateien.map((f) => f.name),
        markenrichtlinien: markenrichtlinien?.name ?? null,
        eingereichtAm: new Date().toISOString(),
      }
      // eslint-disable-next-line no-console
      console.log("[Briefing] Platzhalter-Submit – Payload:", payload)

      toast.success("Briefing erfolgreich übermittelt.")
      router.push("/briefing/danke")
    } catch {
      setSubmitError(
        "Beim Absenden ist ein Fehler aufgetreten. Deine Eingaben bleiben erhalten – bitte versuche es erneut.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Bei Validierungsfehlern: zum ersten fehlerhaften Feld scrollen
  function onInvalid() {
    const firstError = document.querySelector('[aria-invalid="true"]')
    firstError?.scrollIntoView({ behavior: "smooth", block: "center" })
    if (firstError instanceof HTMLElement) firstError.focus({ preventScroll: true })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-8"
        noValidate
      >
        {isOffline ? (
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Keine Verbindung</AlertTitle>
            <AlertDescription>
              Du bist offline. Eingaben gehen nicht verloren – das Absenden ist
              erst wieder möglich, sobald du online bist.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Honeypot – für Menschen unsichtbar, Bots füllen es aus */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website_hp">Website (nicht ausfüllen)</label>
          <input
            id="website_hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("website_hp")}
          />
        </div>

        {/* === Abschnitt 1: Auftraggeber / Kontakt === */}
        <Section
          step={1}
          title="Auftraggeber / Kontakt"
          description="Wer steht hinter dem Produkt und wie erreichen wir dich?"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Firma / Marke
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="z. B. NutriBoost GmbH" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ansprechpartner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ansprechpartner – Name
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="z. B. Anna Muster" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    E-Mail
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      inputMode="email"
                      placeholder="anna@marke.de"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="optional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <Label>Website / Social-Media-Links</Label>
            <p className="text-sm text-muted-foreground">
              Optional – füge beliebig viele Links hinzu.
            </p>
            <div className="space-y-2">
              {linksArray.fields.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input
                    placeholder="https://…"
                    aria-label={`Link ${index + 1}`}
                    {...form.register(`links.${index}.url` as const)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => linksArray.remove(index)}
                    disabled={linksArray.fields.length === 1}
                    aria-label={`Link ${index + 1} entfernen`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => linksArray.append({ url: "" })}
            >
              <Plus className="mr-1 h-4 w-4" /> Link hinzufügen
            </Button>
          </div>
        </Section>

        {/* === Abschnitt 2: Produkt-Basics === */}
        <Section
          step={2}
          title="Produkt-Basics"
          description="Die wichtigsten Eckdaten zu deinem Produkt."
        >
          <FormField
            control={form.control}
            name="produktname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Produktname
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input placeholder="z. B. Sleep Complex Forte" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="produktkategorie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Produktkategorie
                    <RequiredMark />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Bitte wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRODUKTKATEGORIEN.map((k) => (
                        <SelectItem key={k} value={k}>
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="darreichungsform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Darreichungsform
                    <RequiredMark />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Bitte wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DARREICHUNGSFORMEN.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {kategorie === "Sonstiges" ? (
            <FormField
              control={form.control}
              name="produktkategorieSonstiges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategorie (Sonstiges) – bitte angeben</FormLabel>
                  <FormControl>
                    <Input placeholder="Welche Kategorie?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {darreichung === "Sonstiges" ? (
            <FormField
              control={form.control}
              name="darreichungsformSonstiges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Darreichungsform (Sonstiges) – bitte angeben
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Welche Form?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <FormField
            control={form.control}
            name="kurzbeschreibung"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Kurzbeschreibung (1–2 Sätze)
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Worum geht es bei deinem Produkt in einem Satz?"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* === Abschnitt 3: Wirkung & Inhaltsstoffe === */}
        <Section
          step={3}
          title="Wirkung & Inhaltsstoffe"
          description="Der Kern für die Animation – wie wirkt dein Produkt?"
        >
          <FormField
            control={form.control}
            name="inhaltsstoffe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hauptwirkstoffe / Inhaltsstoffe
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="z. B. Magnesiumbisglycinat, L-Theanin, Melatonin …"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="wirkmechanismus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wirkmechanismus: Wie wirkt es im Körper?
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Beschreibe in einfachen Worten, was im Körper passiert."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="wirkungsorte"
            render={() => (
              <FormItem>
                <FormLabel>
                  Wo im Körper passiert die Wirkung?
                  <RequiredMark />
                </FormLabel>
                <FormDescription>
                  Mehrfachauswahl möglich – ergänze bei Bedarf im Freitext.
                </FormDescription>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {WIRKUNGSORTE.map((ort) => (
                    <FormField
                      key={ort.id}
                      control={form.control}
                      name="wirkungsorte"
                      render={({ field }) => {
                        const checked = field.value?.includes(ort.id)
                        return (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  const next = value
                                    ? [...(field.value ?? []), ort.id]
                                    : (field.value ?? []).filter(
                                        (v) => v !== ort.id,
                                      )
                                  field.onChange(next)
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {ort.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="wirkungsorteFreitext"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wirkungsort – Ergänzung (Freitext)</FormLabel>
                <FormControl>
                  <Input placeholder="optional, z. B. Zellebene, Nervensystem …" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vorteile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Die 3 wichtigsten Vorteile / Versprechen
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={"1. …\n2. …\n3. …"}
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="verboteneClaims"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verbotene / zu vermeidende Health-Claims</FormLabel>
                <FormDescription>
                  Rechtlicher Hinweis: Aussagen, die wir NICHT verwenden dürfen.
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="optional, z. B. „heilt …“, „verhindert …“"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* === Abschnitt 4: Zielgruppe & Tonalität === */}
        <Section
          step={4}
          title="Zielgruppe & Tonalität"
          description="Für wen ist das Produkt und wie soll es sich anfühlen?"
        >
          <FormField
            control={form.control}
            name="zielgruppe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Zielgruppe (Alter, Geschlecht, Lifestyle)
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="z. B. Frauen 25–40, sportlich, gesundheitsbewusst"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="geloestesProblem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Welches Problem löst das Produkt für sie?
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="z. B. Einschlafprobleme nach stressigen Tagen"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tonalitaet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Gewünschte Tonalität
                  <RequiredMark />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="sm:max-w-sm">
                      <SelectValue placeholder="Bitte wählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TONALITAETEN.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {tonalitaet === "Sonstiges" ? (
            <FormField
              control={form.control}
              name="tonalitaetSonstiges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tonalität (Sonstiges) – bitte angeben</FormLabel>
                  <FormControl>
                    <Input placeholder="Welche Tonalität?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
        </Section>

        {/* === Abschnitt 5: Umfang & Format === */}
        <Section
          step={5}
          title="Umfang & Format"
          description="Wie groß ist das Projekt und welche Formate brauchst du?"
        >
          <FormField
            control={form.control}
            name="auftragsart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Art des Auftrags
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col gap-2 sm:flex-row sm:gap-6"
                  >
                    {AUFTRAGSARTEN.map((a) => (
                      <FormItem
                        key={a}
                        className="flex items-center space-x-2 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={a} />
                        </FormControl>
                        <FormLabel className="font-normal">{a}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="laenge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gewünschte Länge
                    <RequiredMark />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Bitte wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LAENGEN.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sprachen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sprache(n)
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="z. B. Deutsch, Englisch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {laenge === "Sonstiges" ? (
            <FormField
              control={form.control}
              name="laengeSonstiges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Länge (Sonstiges) – bitte angeben</FormLabel>
                  <FormControl>
                    <Input placeholder="z. B. 45s" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <FormField
            control={form.control}
            name="seitenverhaeltnisse"
            render={() => (
              <FormItem>
                <FormLabel>
                  Seitenverhältnis / Plattform
                  <RequiredMark />
                </FormLabel>
                <FormDescription>Mehrfachauswahl möglich.</FormDescription>
                <div className="grid gap-3 sm:grid-cols-3">
                  {SEITENVERHAELTNISSE.map((sv) => (
                    <FormField
                      key={sv.id}
                      control={form.control}
                      name="seitenverhaeltnisse"
                      render={({ field }) => {
                        const checked = field.value?.includes(sv.id)
                        return (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  const next = value
                                    ? [...(field.value ?? []), sv.id]
                                    : (field.value ?? []).filter(
                                        (v) => v !== sv.id,
                                      )
                                  field.onChange(next)
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {sv.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="voiceover"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Voiceover / Sprecher gewünscht?
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-6"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ja" />
                        </FormControl>
                        <FormLabel className="font-normal">Ja</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="nein" />
                        </FormControl>
                        <FormLabel className="font-normal">Nein</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="textOverlays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text-Overlays gewünscht?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-6"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ja" />
                        </FormControl>
                        <FormLabel className="font-normal">Ja</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="nein" />
                        </FormControl>
                        <FormLabel className="font-normal">Nein</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="musikStil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Musik-Stil</FormLabel>
                <FormControl>
                  <Input
                    placeholder="optional, z. B. ruhig-ambient, treibend-elektronisch"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* === Abschnitt 6: Visuals & Assets === */}
        <div id="section-visuals">
          <Section
            step={6}
            title="Visuals & Assets"
            description="Bilder und Markenmaterial – damit wir deine Markenwelt treffen."
          >
            {/* Produktfotos (Pflicht) */}
            <div className="space-y-3">
              <Label>
                Produktfoto(s)
                <RequiredMark />
              </Label>
              <p className="text-sm text-muted-foreground">
                Mindestens 1 Foto, idealerweise freigestellt. {ALLOWED_IMAGE_LABEL}.
              </p>
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50",
                  fotoFehler && "border-destructive",
                )}
              >
                <Upload className="h-5 w-5" />
                <span>Dateien auswählen oder hierher ziehen</span>
                <input
                  type="file"
                  className="sr-only"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  multiple
                  onChange={handleProduktfotos}
                  aria-label="Produktfotos hochladen"
                />
              </label>

              {produktfotos.length > 0 ? (
                <ul className="space-y-2">
                  {produktfotos.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
                    >
                      <span className="truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProduktfoto(index)}
                        aria-label={`${file.name} entfernen`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {fotoFehler ? (
                <p className="text-sm font-medium text-destructive">
                  {fotoFehler}
                </p>
              ) : null}
            </div>

            {/* Logo (optional) */}
            <div className="space-y-2">
              <Label>Logo</Label>
              <p className="text-sm text-muted-foreground">
                Optional – Vektor oder PNG.
              </p>
              <Input
                type="file"
                accept="image/png,image/svg+xml,.svg,.ai,.eps,.pdf"
                onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                aria-label="Logo hochladen"
              />
              {logo ? (
                <p className="text-sm text-muted-foreground">
                  Ausgewählt: {logo.name}
                </p>
              ) : null}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="brandFarben"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand-Farben</FormLabel>
                    <FormControl>
                      <Input placeholder="optional, z. B. #0A2540, #00C2A8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brandSchriften"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand-Schriften</FormLabel>
                    <FormControl>
                      <Input placeholder="optional, z. B. Inter, Playfair Display" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Referenz-Links */}
            <div className="space-y-3">
              <Label>Referenzvideos („so soll es aussehen“) – Links</Label>
              <p className="text-sm text-muted-foreground">
                Optional – Links zu Videos, die dir gefallen.
              </p>
              <div className="space-y-2">
                {refLinksArray.fields.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input
                      placeholder="https://…"
                      aria-label={`Referenz-Link ${index + 1}`}
                      {...form.register(`referenzLinks.${index}.url` as const)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => refLinksArray.remove(index)}
                      disabled={refLinksArray.fields.length === 1}
                      aria-label={`Referenz-Link ${index + 1} entfernen`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refLinksArray.append({ url: "" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Link hinzufügen
              </Button>
            </div>

            {/* Referenz-Dateien (optional) */}
            <div className="space-y-3">
              <Label>Referenzvideos / -dateien – Upload</Label>
              <p className="text-sm text-muted-foreground">
                Optional, max. 10 MB pro Datei.
              </p>
              <Input
                type="file"
                multiple
                onChange={handleReferenzDateien}
                aria-label="Referenzdateien hochladen"
              />
              {referenzDateien.length > 0 ? (
                <ul className="space-y-2">
                  {referenzDateien.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
                    >
                      <span className="truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReferenzDatei(index)}
                        aria-label={`${file.name} entfernen`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* Markenrichtlinien (optional) */}
            <div className="space-y-2">
              <Label>Vorhandene Markenrichtlinien</Label>
              <p className="text-sm text-muted-foreground">Optional – z. B. PDF.</p>
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) =>
                  setMarkenrichtlinien(e.target.files?.[0] ?? null)
                }
                aria-label="Markenrichtlinien hochladen"
              />
              {markenrichtlinien ? (
                <p className="text-sm text-muted-foreground">
                  Ausgewählt: {markenrichtlinien.name}
                </p>
              ) : null}
            </div>
          </Section>
        </div>

        {/* === Abschnitt 7: Rahmenbedingungen === */}
        <Section
          step={7}
          title="Rahmenbedingungen"
          description="Zeitplan, Budget und letzte Details."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wunsch-Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget-Rahmen</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="optional, z. B. 2.000–4.000 €"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="callToAction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call-to-Action am Ende</FormLabel>
                <FormControl>
                  <Input
                    placeholder="optional, z. B. „Jetzt kaufen“, Rabattcode, Website"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="anmerkungen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sonstige Anmerkungen</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="optional – alles, was wir sonst noch wissen sollten."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* === Abschluss: DSGVO + Absenden === */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="datenschutz"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-required="true"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-tight">
                    <FormLabel className="font-normal">
                      Ich stimme der Verarbeitung meiner Daten gemäß der
                      Datenschutzerklärung zu.
                      <RequiredMark />
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {submitError ? (
              <Alert variant="destructive">
                <AlertTitle>Absenden fehlgeschlagen</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            {isSubmitting ? (
              <div className="space-y-2" aria-live="polite">
                <p className="text-sm text-muted-foreground">
                  Briefing wird übermittelt… {progress}%
                </p>
                <Progress value={progress} />
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={isSubmitting || isOffline}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet…
                </>
              ) : (
                "Briefing absenden"
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Hinweis: Die Speicherung ist aktuell ein Platzhalter. Die echte
              Übermittlung an Supabase wird im Backend-Schritt aktiviert.
            </p>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
