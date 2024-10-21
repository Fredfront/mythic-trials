'use client'

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function InfoBoxComponent()
{
  return (
    <Alert variant="warning" className="max-w-md mx-auto w-full min-w-full">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Important Notice</AlertTitle>
      <AlertDescription>
        Please be aware that if you do not submit your match results within 24 hours of the match, you will lose by walkover.
      </AlertDescription>
    </Alert>
  )
}