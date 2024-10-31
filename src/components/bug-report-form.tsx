'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useGetUserData } from '@/app/auth/useGetUserData'

export default function BugReportForm()
{
  const { user } = useGetUserData()
  const userEmail = user?.data.user?.email
  const username = user?.data.user?.identities?.find(identity => identity.provider === 'discord')?.identity_data?.full_name

  const [ isSubmitting, setIsSubmitting ] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: { preventDefault: () => void; currentTarget: any }) =>
  {
    event.preventDefault()
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const bugReport = Object.fromEntries(formData.entries())

    // Include navigator data in the payload
    const navigatorData = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      vendor: navigator.vendor,
    }

    const bugReportWithDetails = {
      ...bugReport,
      from: userEmail || 'Anonymous',
      username: username || 'Anonymous',
      navigator: navigatorData,
    }

    try {
      const response = await fetch('/api/discord/send-bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bugReportWithDetails),
      })

      if (response.ok) {
        toast({
          title: 'Bug Report Submitted',
          description: "Thank you for your report. We'll investigate the issue and get back to you soon.",
        })
        form.reset()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit bug report')
      }
    } catch (error) {
      console.error('Submission Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit bug report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-[50px] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto bg-gray-800 text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Rapporter bug</CardTitle>
          <CardDescription className="text-gray-300">Vennligst beskriv bug så detaljert som mulig</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-200">Bug tittel</Label>
              <Input id="title" name="title" placeholder="Brief description of the issue" required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-200">Detaljert beskrivelse</Label>
              <Textarea id="description" name="description" placeholder="Provide a detailed explanation of the bug" required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[100px]" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
              {isSubmitting ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : 'Submit Bug Report'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}