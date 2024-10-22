'use client'

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function InfoBoxComponent({ title, description }: { title: string; description: string }) {
  return (
    <Alert variant="warning" className="max-w-md mx-auto w-full min-w-full">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
