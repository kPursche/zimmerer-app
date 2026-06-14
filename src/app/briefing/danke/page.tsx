import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Briefing erhalten – Danke!",
  description: "Dein Animations-Briefing wurde erfolgreich übermittelt.",
}

export default function BriefingDankePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center space-y-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
          </span>
          <CardTitle className="text-2xl">Briefing erhalten!</CardTitle>
          <CardDescription className="text-base">
            Vielen Dank – dein Animations-Briefing ist bei uns eingegangen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Wir sehen uns deine Angaben in Ruhe an und melden uns per E-Mail bei
            dir, falls wir noch Rückfragen haben. Du musst nichts weiter tun.
          </p>
          <Button asChild variant="outline">
            <Link href="/briefing">Weiteres Briefing einreichen</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
