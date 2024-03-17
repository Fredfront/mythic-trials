'use client'
import { Icons } from '@/components/loading'
import { useState } from 'react'

export default function Contact() {
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  async function handleSubmit(event: any) {
    event.preventDefault()
    const formData = new FormData(event.target)

    if (
      formData.get('email') === undefined ||
      formData.get('subject') === undefined ||
      formData.get('message') === undefined
    ) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/contact', {
        method: 'post',
        body: formData,
      })

      if (!response.ok) {
        setLoading(false)
        throw new Error(`response status: ${response.status}`)
      }
      const responseData = await response.json()

      if (responseData.message === 'Success: email was sent') {
        setLoading(false)
        setSuccess(true)
      }
      if (responseData.message === 'Error: email was not sent') {
        setLoading(false)
        setError(true)
      }
    } catch (err) {
      setLoading(false)
      setError(true)
    }
  }

  if (loading)
    return (
      <main className="flex min-h-screen flex-col items-center">
        <h1 className="text-2xl md:text-5xl font-bold mt-8 mb-4">
          Sender melding... <Icons.spinner className="inline h-6 w-6 md:h-10 md:w-10 animate-spin mt-1 ml-2" />{' '}
        </h1>
      </main>
    )

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center">
        <h1 className="text-2xl md:text-5xl font-bold mt-8 mb-4">Noe gikk galt</h1>
        <p className="mb-4">Beklager, noe gikk galt. Vennligst prøv igjen senere.</p>
      </main>
    )
  }
  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center">
        <h1 className="text-2xl md:text-5xl font-bold mt-8 mb-4">Takk for din henvendelse!</h1>
        <p className="mb-4">Vi vil svare deg så fort som mulig.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <h1 className="text-5xl font-bold mt-8 mb-4">Kontakt oss</h1>
      <p className="mb-4 p-4">Har du spørsmål eller ønsker å komme i kontakt med oss? Send oss en melding!</p>
      <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
        <div className="mb-4 flex flex-col w-500">
          <label htmlFor="form-email"> Din email</label>
          <input
            id="form-email"
            required
            autoComplete="email"
            maxLength={80}
            name="email"
            type="email"
            className=" rounded-l-lg  p-2 mb-2 w-full bg-gray-800 text-white"
          />
          <label htmlFor="form-subject"> Emne </label>
          <input
            id="form-subject"
            required
            name="subject"
            type="text"
            className=" rounded-l-lg  p-2 mb-2 w-full bg-gray-800 text-white"
          />
          <label htmlFor="form-name"> Lagnavn </label>
          <input
            id="form-teamName"
            required
            name="teamName"
            type="text"
            className=" rounded-l-lg  p-2 mb-2 w-full bg-gray-800 text-white"
          />
          <label htmlFor="form-message"> Din melding </label>
          <textarea
            id="form-message"
            required
            name="message"
            rows={5}
            className=" rounded-lg p-2 mb-2 w-full bg-gray-800 text-white"
          />
        </div>
        <button className=" rounded-full bg-[#FDB202] min-w-32 h-8" type="submit">
          Send
        </button>
      </form>
    </main>
  )
}
