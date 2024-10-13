'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

interface ReadyScreenProps
{
  round: number
  homeTeam: string
  awayTeam: string
  teamReady: boolean
  opponentReady: boolean
  setReady: () => void
}

export default function ReadyScreen({
  round,
  homeTeam,
  awayTeam,
  teamReady,
  opponentReady,
  setReady
}: ReadyScreenProps)
{
  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Pick and Ban</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Round: {round}</h2>
            <h3 className="text-xl">{homeTeam} vs {awayTeam}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4">
                <h4 className="text-lg font-semibold mb-2">Your Team</h4>
                {teamReady ? (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-500" />
                )}
                <p className="mt-2">{teamReady ? 'Ready' : 'Not Ready'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4">
                <h4 className="text-lg font-semibold mb-2">Opponent</h4>
                {opponentReady ? (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-500" />
                )}
                <p className="mt-2">{opponentReady ? 'Ready' : 'Not Ready'}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={setReady}
              className={`${teamReady ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} min-w-[200px]`}
              disabled={teamReady}
            >
              {teamReady ? 'Ready' : 'Set Ready'}
            </Button>
          </div>

          {teamReady && !opponentReady && (
            <p className="text-center text-yellow-600">Waiting for opponent to be ready...</p>
          )}
          {!teamReady && opponentReady && (
            <p className="text-center text-yellow-600">Your opponent is ready. Please set your team to ready.</p>
          )}
          {teamReady && opponentReady && (
            <p className="text-center text-green-600 font-semibold">Both teams are ready! The Pick Ban session will start shortly.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}