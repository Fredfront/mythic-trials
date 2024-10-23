'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface CompletedScreenProps {
  homeTeam: string
  awayTeam: string
  pickedDungeons: Array<{ id: number; name: string; image: string }>
  tiebreakerDungeon: { id: number; name: string; image: string } | null
  round: number
}

export default function CompletedScreen({
  homeTeam,
  awayTeam,
  pickedDungeons,
  tiebreakerDungeon,
  round,
}: CompletedScreenProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center">
            <Trophy className="w-8 h-8 mr-2 text-yellow-500" />
            Pick Ban Completed
            <Trophy className="w-8 h-8 ml-2 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">
              {homeTeam} vs {awayTeam}
            </h2>
            <p className="text-lg text-white">Følgende dungeons er valgt:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pickedDungeons.map((dungeon, index) => (
              <Card className="text-white" key={dungeon.id}>
                <CardContent className="p-4">
                  <div className="relative h-48 mb-2">
                    <Image
                      src={dungeon.image}
                      alt={dungeon.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                      Dungeon {index + 1}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-center">{dungeon.name}</h3>
                </CardContent>
              </Card>
            ))}

            {tiebreakerDungeon && (
              <Card className="text-white">
                <CardContent className="p-4">
                  <div className="relative h-48 mb-2">
                    <Image
                      src={tiebreakerDungeon.image}
                      alt={tiebreakerDungeon.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">Tiebreaker</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-center">{tiebreakerDungeon.name}</h3>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="text-center text-lg">
            <p className="flex items-center justify-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              Lykke til i kampen!
            </p>
          </div>
        </CardContent>
        <div className="w-full flex justify-center p-4">
          <Button
            className="bg-white text-black min-w-[75px]"
            onClick={() =>
              router.push('/my-matches/results?home=' + homeTeam + '&away=' + awayTeam + '&round=' + round)
            }
          >
            Legg til resultater for kamper
          </Button>
        </div>
      </Card>
    </div>
  )
}
