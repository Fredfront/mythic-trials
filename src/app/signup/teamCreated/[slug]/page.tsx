'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React from 'react'

function TeamHasBeenChanged() {
  const searchParams = useSearchParams()
  const teamHasBeenCreated = searchParams.get('created')
  const teamHasBeenUpdated = searchParams.get('updated')

  return (
    <div className="w-full grid place-content-center items-center h-screen">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold  mb-10 text-center p-2">
          {teamHasBeenCreated ? 'Laget ditt er opprettet!' : null}{' '}
          {teamHasBeenUpdated ? 'Laget ditt er blitt oppdatert' : null}{' '}
        </h1>

        <Link href="/" className="mt-4">
          <Button>Gå tilbake til forsiden</Button>
        </Link>
      </div>
    </div>
  )
}

export default TeamHasBeenChanged
