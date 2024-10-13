'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import supabase from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Shield } from "lucide-react"
import { dungeonConfig } from '../../../turnering/utils/dungeonConfig'
import { TMatchData } from '../../../turnering/components/Matches'
import { PickAndBansType } from '../Matches'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import ReadyScreen from './pickban/ReadyScreen'
import CompletedScreen from './pickban/CompletedScreen'

function PickBanV2({
  matchData,
  pickAndBansTable,
  contact_person,
  sanityTeamData
}: {
  matchData: TMatchData[]
  pickAndBansTable: PickAndBansType[]
  contact_person: string
  sanityTeamData: MythicPlusTeam[]
})
{
  const searchParams = useSearchParams()
  const homeTeam = searchParams.get('home')
  const awayTeam = searchParams.get('away')

  const round = matchData?.[ 0 ]?.round
  const opponentTeam = matchData?.find((match) => match.contactPerson === undefined)?.team_slug

  const myPickAndBansTable = pickAndBansTable.find((e) => e.contact_person === contact_person && e.round === round)
  const opponentPickAndBansTable = pickAndBansTable.find((e) => e.team_slug === opponentTeam && e.round === round)

  const [ myTeamData, setMyTeamData ] = useState<PickAndBansType | undefined>(myPickAndBansTable)
  const [ opponentData, setOpponentData ] = useState<PickAndBansType | undefined>(opponentPickAndBansTable)

  const [ teamReady, setTeamReady ] = useState(!!myPickAndBansTable)
  const [ opponentReady, setOpponentReady ] = useState(!!opponentData?.ready)


  const isMyTurn = myTeamData?.my_turn === true



  useEffect(() =>
  {
    if (myTeamData?.ready !== teamReady) {
      setTeamReady(myTeamData?.ready === true)
    }
  }, [ teamReady, myTeamData ])

  useEffect(() =>
  {
    if (opponentData?.ready !== opponentReady) {
      setOpponentReady(!!opponentData?.ready)
    }
  }, [ opponentData, opponentReady ])

  useEffect(() =>
  {
    async function fetchData()
    {
      if (!contact_person || !round) return
      const { data: myTeamData, error } = await supabase
        .from('pick_ban')
        .select()
        .eq('contact_person', contact_person)
        .eq('round', round)

      if (myTeamData && myTeamData.length > 0) {
        setMyTeamData(myTeamData[ 0 ])
      }
    }
    fetchData()
  }, [ contact_person, round ])

  useEffect(() =>
  {
    async function fetchData()
    {
      if (!opponentTeam || !round) return
      const { data: opponentData, error } = await supabase
        .from('pick_ban')
        .select()
        .eq('team_slug', opponentTeam)
        .eq('round', round)

      if (opponentData && opponentData.length > 0) {
        setOpponentData(opponentData[ 0 ])
      }
    }
    fetchData()
  }, [ opponentTeam, round ])



  async function setReady()
  {
    if (!contact_person || !round) return
    await supabase
      .from('pick_ban')
      .update({ ready: !teamReady })
      .eq('contact_person', contact_person)
      .eq('round', round)
    setTeamReady(!teamReady)
  }

  async function setPickedDungeon(dungeon: number)
  {
    if (!contact_person || !round) return
    await supabase.from('pick_ban').update({ pick: dungeon, my_turn: false }).eq('contact_person', contact_person).eq('round', round)
  }

  const setCompleted = useCallback(async () =>
  {
    if (!contact_person || !round) return
    await supabase.from('pick_ban').update({ completed: true }).eq('contact_person', contact_person).eq('round', round)
  }, [ contact_person, round ])

  async function setBannedDungeons(dungeon: number)
  {
    if (!contact_person || !round) return
    const existingBans = myTeamData?.bans || []
    const newBans = [ ...existingBans, dungeon ]
    await supabase.from('pick_ban').update({ bans: newBans, my_turn: false }).eq('contact_person', contact_person).eq('round', round)
  }

  const pickedDungeons = [ myTeamData?.pick, opponentData?.pick ].filter(Boolean) as number[]
  const bannedDungeons = useMemo(() => ([ ...(myTeamData?.bans || []), ...(opponentData?.bans || []) ]), [ myTeamData?.bans, opponentData?.bans ])

  const stepOrderPickAndBan = [
    { team: awayTeam, action: 'ban', step: 1 },
    { team: homeTeam, action: 'ban', step: 2 },
    { team: awayTeam, action: 'pick', step: 3 },
    { team: homeTeam, action: 'pick', step: 4 },
    { team: awayTeam, action: 'ban', step: 5 },
    { team: homeTeam, action: 'ban', step: 6 },
    { team: awayTeam, action: 'ban', step: 7 }
  ]

  const updateTurn = useCallback(async () =>
  {
    if (!contact_person || !round || !opponentData?.step) return
    await supabase.from('pick_ban').update({ my_turn: true, step: opponentData.step + 1 }).eq('contact_person', contact_person).eq('round', round)
  }, [ contact_person, opponentData?.step, round ])

  useEffect(() =>
  {
    const channel = supabase
      .channel('pick_ban')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pick_ban',
        },
        (payload) =>
        {
          console.log('Change received!', payload)

          const updatedData = payload.new as PickAndBansType

          if (payload.new.contact_person === contact_person && round === payload.new.round) {
            setMyTeamData(updatedData)
          }

          if (payload.new.team_slug === opponentTeam && round === payload.new.round) {
            setOpponentData(updatedData)
          }

          if (payload.new.team_slug === opponentTeam && payload.new.ready === true) {
            setOpponentReady(true)
            if (myTeamData?.my_turn === false && payload.new.my_turn === false) {
              updateTurn()
            }
          }
        },
      )
      .subscribe()

    return () =>
    {
      supabase.removeChannel(channel)
    }
  }, [ contact_person, myTeamData?.my_turn, opponentTeam, round, updateTurn ])

  const completed = useMemo(
    () => myTeamData?.completed === true && opponentData?.completed === true,
    [ myTeamData?.completed, opponentData?.completed ],
  )

  useEffect(() =>
  {
    if (myTeamData?.completed === false && bannedDungeons && pickedDungeons && pickedDungeons.length === 2 && bannedDungeons.length === 5) {
      setCompleted()
    }
  }, [ bannedDungeons, myTeamData?.completed, pickedDungeons, setCompleted ])


  const getDungeonStatus = (dungeonId: number) =>
  {
    if (pickedDungeons.includes(dungeonId)) return 'picked'
    if (bannedDungeons.includes(dungeonId)) return 'banned'
    return 'available'
  }

  const getButtonLabel = (dungeonId: number) =>
  {
    if (myTeamData?.step === undefined) return
    const status = getDungeonStatus(dungeonId)
    if (status === 'picked') return 'Picked'
    if (status === 'banned') return 'Banned'
    return stepOrderPickAndBan[ myTeamData?.step - 1 ]?.action === 'pick' ? 'Pick' : 'Ban'
  }

  const getTiebreaker = () =>
  {
    return dungeonConfig.find(dungeon => !pickedDungeons.includes(dungeon.id) && !bannedDungeons.includes(dungeon.id))
  }

  console.log(getTiebreaker())

  if (!round || !homeTeam || !awayTeam) {
    return <div className="container mx-auto p-4 text-center">Loading match data...</div>
  }

  if (!teamReady || !opponentReady) {
    return (
      <ReadyScreen homeTeam={homeTeam} awayTeam={awayTeam} round={round} opponentReady={opponentReady} setReady={setReady} teamReady={teamReady} />
    )
  }

  if (completed) {
    return (
      <CompletedScreen round={round} awayTeam={awayTeam} homeTeam={homeTeam} pickedDungeons={[
        ...pickedDungeons.map((id) =>
        {
          const dungeon = dungeonConfig.find(d => d.id === id)
          return {
            id: dungeon?.id || 0,
            name: dungeon?.name || '',
            image: dungeon?.image || ''
          }
        })
      ]} tiebreakerDungeon={
        {
          id: getTiebreaker()?.id || 0,
          name: getTiebreaker()?.name || '',
          image: getTiebreaker()?.image || ''
        }
      } />
    )
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-10">{homeTeam} vs {awayTeam}</h1>
      <div className={`grid grid-cols-1 ${completed ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-8`}>
        {!completed && <div className="lg:col-span-2">
          <div className="mb-4">
            <p className="text-2xl font-semibold text-center">
              {isMyTurn
                ? `Your turn to ${stepOrderPickAndBan[ myTeamData.step - 1 ]?.action === 'pick' ? 'pick' : 'ban'}`
                : "Waiting for opponent's move"}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {dungeonConfig.map((dungeon) =>
            {
              const status = getDungeonStatus(dungeon.id)
              return (
                <Card key={dungeon.id} className={`overflow-hidden ${status !== 'available' ? 'opacity-75' : ''}`}>
                  <CardContent className="p-0 relative">
                    <div className="relative h-36">
                      <Image
                        src={dungeon.image}
                        alt={dungeon.name}
                        layout="fill"
                        objectFit="cover"
                      />
                      {status !== 'available' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          {status === 'picked' && <Check className="text-green-500 w-12 h-12" />}
                          {status === 'banned' && <X className="text-red-500 w-12 h-12" />}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-sm mb-2">{dungeon.name}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant={status === 'picked' ? 'success' : status === 'banned' ? 'destructive' : 'secondary'}>
                          {status === 'picked' ? 'Picked' : status === 'banned' ? 'Banned' : 'Available'}
                        </Badge>
                        <Button
                          onClick={() =>
                          {
                            if (isMyTurn && status === 'available') {
                              if (stepOrderPickAndBan[ myTeamData.step - 1 ]?.action === 'ban') {
                                setBannedDungeons(dungeon.id)
                              } else {
                                setPickedDungeon(dungeon.id)
                              }
                            }
                          }}
                          disabled={!isMyTurn || status !== 'available'}
                          variant={status === 'available' ? 'default' : 'secondary'}
                          size="sm"
                        >
                          {getButtonLabel(dungeon.id)}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

        </div>}
        <div>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Pick Ban Results</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Check className="text-green-500 w-5 h-5 mr-2" />
                    Picked Dungeons
                  </h3>
                  {pickedDungeons.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {pickedDungeons.map((id) =>
                      {
                        const dungeon = dungeonConfig.find(d => d.id === id)
                        return <li key={id}>{dungeon ? dungeon.name : 'Unknown dungeon'}</li>
                      })}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No dungeons picked yet</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <X className="text-red-500 w-5 h-5 mr-2" />
                    Banned Dungeons
                  </h3>
                  {bannedDungeons.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {bannedDungeons.map((id) =>
                      {
                        const dungeon = dungeonConfig.find(d => d.id === id)
                        return <li key={id}>{dungeon ? dungeon.name : 'Unknown dungeon'}</li>
                      })}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No dungeons banned yet</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Shield className="text-blue-500 w-5 h-5 mr-2" />
                    Tiebreaker Dungeon
                  </h3>
                  {completed ? (
                    <p>{getTiebreaker()?.name || 'No tiebreaker available'}</p>
                  ) : (
                    <p className="text-muted-foreground">To be determined</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PickBanV2