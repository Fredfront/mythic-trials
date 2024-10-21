'use client'

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function InfoBoxComponent()
{
  return (
    <Alert variant="warning" className="max-w-md mx-auto w-full min-w-full">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Viktig melding</AlertTitle>
      <AlertDescription>
        Vennligst vær oppmerksom på at hvis du ikke sender inn kampresultatene dine innen 24 timer etter kampen, vil du automatisk tape på walkover.
      </AlertDescription>
    </Alert>
  )
}