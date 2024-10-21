'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function ContactForm() {
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    if (
      !formData.get('email') ||
      !formData.get('subject') ||
      !formData.get('message')
    ) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const responseData = await response.json()

      if (responseData.message === 'Success: email was sent') {
        setSuccess(true)
      } else {
        throw new Error('Email was not sent')
      }
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sender melding...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">Noe gikk galt</CardTitle>
          <AlertCircle className="h-12 w-12 mx-auto mt-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <p className="text-center">Beklager, noe gikk galt. Vennligst prøv igjen senere.</p>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Takk for din henvendelse!</CardTitle>
          <CheckCircle className="h-12 w-12 mx-auto mt-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-center">Vi vil svare deg så fort som mulig.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Kontakt oss</CardTitle>
        <CardDescription>Har du spørsmål eller ønsker å komme i kontakt med oss? Send oss en melding!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-email">Din email</Label>
            <Input
              id="form-email"
              required
              autoComplete="email"
              maxLength={80}
              name="email"
              type="email"
              placeholder="din@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-subject">Emne</Label>
            <Input
              id="form-subject"
              required
              name="subject"
              type="text"
              placeholder="Skriv emnet her"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-message">Din melding</Label>
            <Textarea
              id="form-message"
              required
              name="message"
              rows={5}
              placeholder="Skriv din melding her..."
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button className="w-full" type="submit">
          <Mail className="mr-2 h-4 w-4" /> Send melding
        </Button>
      </CardFooter>
    </Card>
  )
}