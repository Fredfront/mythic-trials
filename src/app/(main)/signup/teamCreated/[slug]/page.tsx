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
      <div className="flex flex-col">
        {teamHasBeenCreated ? <TeamHasBeenCreatedComponent /> : null}{' '}
        {teamHasBeenUpdated ? <TeamHasBeenUpdated /> : null}{' '}
        <Link href="/" className="mt-4 pl-10 ">
          <Button>Gå tilbake til forsiden</Button>
        </Link>
      </div>
    </div>
  )
}

export default TeamHasBeenChanged

const TeamHasBeenCreatedComponent = () => {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold  mb-4  ">Laget ditt ble opprettet!</h1>
      <p>
        Når en admin har godkjent registreringen din, kommer laget til å vises her på nettsiden. Første dag av
        turneringen 2. april, mer info kommer når det nærmer seg.
      </p>
    </div>
  )
}

const TeamHasBeenUpdated = () => {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold  mb-4  ">Laget ditt ble oppdatert!</h1>
      <p>Det kan ta noen minutter før endringene dine blir synlige på nettsiden.</p>
    </div>
  )
}
