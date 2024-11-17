'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import Image from 'next/image'
import { urlForImage } from '../../../../../../../sanity/lib/image'

interface ReadyScreenProps {
  round: number
  homeTeam: string
  awayTeam: string
  teamReady: boolean
  opponentReady: boolean
  setReady: ({
    sanityTeamData,
    email,
    contact_person,
    round,
    teamReady,
    homeTeam,
    awayTeam,
  }: {
    sanityTeamData: MythicPlusTeam[]
    email: string
    contact_person: string
    round: number
    teamReady: boolean
    homeTeam: string
    awayTeam: string
  }) => void
  sanityTeamData: MythicPlusTeam[]
  email: string
  contact_person: string
}

export default function ReadyScreen({
  round,
  homeTeam,
  awayTeam,
  teamReady,
  opponentReady,
  setReady,
  sanityTeamData,
  email,
  contact_person,
}: ReadyScreenProps) {
  const [isCooldown, setIsCooldown] = useState(false)
  const [cooldownTimer, setCooldownTimer] = useState(10)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isCooldown) {
      // Start countdown
      timer = setInterval(() => {
        setCooldownTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsCooldown(false)
            setCooldownTimer(10) // Reset timer
            return 10
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [isCooldown])

  const handleSetReady = () => {
    setReady({ sanityTeamData, email, contact_person, round, teamReady, homeTeam, awayTeam })
    setIsCooldown(true)
  }

  return (
    <div className="container mx-auto p-4 ">
      <Card className="max-w-2xl mx-auto bg-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Pick and Ban</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-gray-800">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Runde: {round}</h2>
            <h3 className="text-xl flex justify-center items-center">
              {sanityTeamData?.find((e) => e.teamSlug === homeTeam)?.teamImage.asset._ref && (
                <Image
                  src={
                    urlForImage(sanityTeamData.find((e) => e.teamSlug === homeTeam)?.teamImage.asset._ref as string) ||
                    ''
                  }
                  alt={`${homeTeam} Logo`}
                  width={45}
                  height={45}
                  className="mr-3 w-8 h-8 rounded-full"
                />
              )}
              {sanityTeamData?.find((e) => e.teamSlug === homeTeam)?.teamName} vs{' '}
              {sanityTeamData?.find((e) => e.teamSlug === awayTeam)?.teamName}
              {sanityTeamData?.find((e) => e.teamSlug === awayTeam)?.teamImage.asset._ref && (
                <Image
                  src={
                    urlForImage(sanityTeamData.find((e) => e.teamSlug === awayTeam)?.teamImage.asset._ref as string) ||
                    ''
                  }
                  alt={`${awayTeam} Logo`}
                  width={45}
                  height={45}
                  className="ml-3 w-8 h-8 rounded-full"
                />
              )}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gray-700 text-white">
              <CardContent className="flex flex-col items-center justify-center p-4">
                <h4 className="text-lg font-semibold mb-2">Ditt lag</h4>
                {teamReady ? (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-500" />
                )}
                <p className="mt-2">{teamReady ? 'Ready' : 'Not Ready'}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-700 text-white">
              <CardContent className="flex flex-col items-center justify-center p-4">
                <h4 className="text-lg font-semibold mb-2">Motstander</h4>
                {opponentReady ? (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-500" />
                )}
                <p className="mt-2">{opponentReady ? 'Ready' : 'Not Ready'}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col items-center">
            <Button
              onClick={handleSetReady}
              disabled={isCooldown}
              className={`min-w-[200px] ${
                teamReady ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-700 text-black'
              } ${isCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {teamReady ? 'Klar' : isCooldown ? `Prøv igjen om ${cooldownTimer}s` : 'Jeg er klar'}
            </Button>
            {isCooldown && (
              <p className="mt-2 text-center text-gray-400">Du må vente {cooldownTimer} før du kan trykke igjen.</p>
            )}
          </div>

          {teamReady && !opponentReady && <p className="text-center text-yellow-600">Venter på motstander...</p>}
          {!teamReady && opponentReady && (
            <p className="text-center text-yellow-600">Motstander er klar. Vennligst gjør deg klar.</p>
          )}
          {teamReady && opponentReady && (
            <p className="text-center text-green-600 font-semibold">
              Begge lag er klare! Pick Ban-sesjonen vil starte snart.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
