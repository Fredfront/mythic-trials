'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import supabase from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Shield } from 'lucide-react'
import { dungeonConfig } from '../../../turnering/utils/dungeonConfig'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import ReadyScreen from './pickban/ReadyScreen'
import CompletedScreen from './pickban/CompletedScreen'
import { useGetUserData } from '@/app/auth/useGetUserData'
import { Match } from '../../../../../../types'
import { createPickBanRowIfNotExist, PickAndBansType } from '../../../../../../supabase/dbFunctions'

function PickBanV2({
  matchData,
  pickAndBansTable,
  contact_person,
  sanityTeamData,
}: {
  matchData: Match & { myTeam: string } & { opponent: string }
  pickAndBansTable: PickAndBansType[]
  contact_person: string
  sanityTeamData: MythicPlusTeam[]
})
{
  const homeTeam = matchData.teams[ 0 ].team_slug
  const awayTeam = matchData.teams[ 1 ].team_slug
  const matchUUID = `${matchData.teams?.[ 0 ].team_slug}-${matchData.teams?.[ 1 ].team_slug}-round-${matchData.teams?.[ 0 ].round}-roundDate-${matchData.teams?.[ 0 ].roundDate}`
  const { user } = useGetUserData()
  const email = user?.data.user?.email
  const round = matchData?.teams[ 0 ]?.round
  const opponentTeam = matchData.opponent
  const myPickAndBansTable = pickAndBansTable.find((e) => e.contact_person === email && e.round === round)
  const opponentPickAndBansTable = pickAndBansTable.find((e) => e.team_slug === opponentTeam && e.round === round)
  const [ myTeamData, setMyTeamData ] = useState<PickAndBansType | undefined>(myPickAndBansTable)
  const [ opponentData, setOpponentData ] = useState<PickAndBansType | undefined>(opponentPickAndBansTable)
  const [ teamReady, setTeamReady ] = useState(!!myPickAndBansTable?.ready)
  const [ opponentReady, setOpponentReady ] = useState(!!opponentData?.ready)
  const isMyTurn = myTeamData?.my_turn === true
  const myTeamSlug = matchData.myTeam
  const isHomeTeam = myPickAndBansTable?.home === true


  useEffect(() =>
  {
    setOpponentReady(opponentData?.ready === true ? true : false)
  }, [ opponentData?.ready ])

  useEffect(() =>
  {
    if (myTeamData?.ready && teamReady === false) {
      setTeamReady(true)
    }
  }, [ myTeamData?.ready, teamReady ])

  useEffect(() =>
  {
    if (!email || !round || !myTeamSlug || !opponentTeam) return
    createPickBanRowIfNotExist({
      email,
      round,
      team_slug: myTeamSlug,
      opponent: opponentTeam,
      home: isHomeTeam,
      matchUUID: matchUUID,
    })
  }, [ email, isHomeTeam, myTeamSlug, opponentTeam, round, matchUUID ])

  useEffect(() =>
  {
    async function fetchData()
    {
      if (!contact_person || !round) return
      await supabase
        .from('pick_ban')
        .select()
        .eq('contact_person', contact_person)
        .eq('round', round)
        .then((res) =>
        {
          if (res.data && res.data.length > 0) {
            setMyTeamData(res.data[ 0 ])
          }
        })
    }
    fetchData()
  }, [ contact_person, round ])

  useEffect(() =>
  {
    async function fetchData()
    {
      if (!opponentTeam || !round) return
      await supabase
        .from('pick_ban')
        .select()
        .eq('team_slug', opponentTeam)
        .eq('round', round)
        .then((res) =>
        {
          if (res.data && res.data.length > 0) {
            setOpponentData(res.data[ 0 ])
          }
        })
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
      .then(() => setTeamReady(!teamReady))
  }

  async function setPickedDungeon(dungeon: number)
  {
    if (!contact_person || !round) return
    await supabase
      .from('pick_ban')
      .update({ pick: dungeon, my_turn: false })
      .eq('contact_person', contact_person)
      .eq('round', round)
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
    await supabase
      .from('pick_ban')
      .update({ bans: newBans, my_turn: false })
      .eq('contact_person', contact_person)
      .eq('round', round)
  }

  const pickedDungeons = [ myTeamData?.pick, opponentData?.pick ].filter(Boolean) as number[]
  const bannedDungeons = useMemo(
    () => [ ...(myTeamData?.bans || []), ...(opponentData?.bans || []) ],
    [ myTeamData?.bans, opponentData?.bans ],
  )

  const stepOrderPickAndBan = [
    { team: awayTeam, action: 'ban', step: 1 },
    { team: homeTeam, action: 'ban', step: 2 },
    { team: awayTeam, action: 'pick', step: 3 },
    { team: homeTeam, action: 'pick', step: 4 },
    { team: awayTeam, action: 'ban', step: 5 },
    { team: homeTeam, action: 'ban', step: 6 },
    { team: awayTeam, action: 'ban', step: 7 },
  ]

  const updateTurn = useCallback(async () =>
  {
    if (!contact_person || !round || !opponentData?.step) return
    await supabase
      .from('pick_ban')
      .update({ my_turn: true, step: opponentData.step + 1 })
      .eq('contact_person', contact_person)
      .eq('round', round)
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
          const updatedData = payload.new as PickAndBansType
          if (payload.new.contact_person === contact_person && round === payload.new.round) {
            setMyTeamData(updatedData)
            setTeamReady(updatedData.ready)
          }

          if (payload.new.team_slug === opponentTeam && round === payload.new.round) {
            setOpponentData(updatedData)
            setOpponentReady(updatedData.ready)
          }
          if (payload.new.team_slug === opponentTeam && payload.new.ready === true) {
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
  }, [ contact_person, myTeamData, opponentTeam, round, updateTurn ])

  const completed = useMemo(
    () => myTeamData?.completed === true && opponentData?.completed === true,
    [ myTeamData?.completed, opponentData?.completed ],
  )

  useEffect(() =>
  {
    if (
      myTeamData?.completed === false &&
      bannedDungeons &&
      pickedDungeons &&
      pickedDungeons.length === 2 &&
      bannedDungeons.length === 5
    ) {
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
    return dungeonConfig.find((dungeon) => !pickedDungeons.includes(dungeon.id) && !bannedDungeons.includes(dungeon.id))
  }

  if (!round || !homeTeam || !awayTeam) {
    return <div className="container mx-auto p-4 text-center">Loading match data...</div>
  }

  if (!teamReady || !opponentReady) {
    return (
      <ReadyScreen
        homeTeam={matchData.teams[ 0 ].team_slug}
        awayTeam={matchData.teams[ 1 ].team_slug}
        round={round}
        opponentReady={opponentReady}
        setReady={setReady}
        teamReady={teamReady}
        sanityTeamData={sanityTeamData}
      />
    )
  }

  if (completed) {
    return (
      <CompletedScreen
        round={round}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        pickedDungeons={[
          ...pickedDungeons.map((id) =>
          {
            const dungeon = dungeonConfig.find((d) => d.id === id)
            return {
              id: dungeon?.id || 0,
              name: dungeon?.name || '',
              image: dungeon?.image || '',
            }
          }),
        ]}
        tiebreakerDungeon={{
          id: getTiebreaker()?.id || 0,
          name: getTiebreaker()?.name || '',
          image: getTiebreaker()?.image || '',
        }}
      />
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-10">
        {homeTeam} vs {awayTeam}
      </h1>
      <div className={`grid grid-cols-1 ${completed ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-8`}>
        {!completed && (
          <div className="lg:col-span-2">
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
                  <Card
                    key={dungeon.id}
                    className={`text-white overflow-hidden ${status !== 'available' ? 'opacity-75' : ''}`}
                  >
                    <CardContent className="p-0 relative">
                      <div className="relative h-36">
                        <Image
                          className="w-full h-full"
                          src={dungeon.image}
                          alt={dungeon.name}
                          height={500}
                          width={300}
                          objectFit="contain"
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
                          <Badge
                            variant={
                              status === 'picked' ? 'success' : status === 'banned' ? 'destructive' : 'secondary'
                            }
                          >
                            {status === 'picked' ? 'Picked' : status === 'banned' ? 'Banned' : 'Available'}
                          </Badge>
                          {status === 'available' && isMyTurn && (
                            <Button
                              className={`${getButtonLabel(dungeon.id) === 'Pick' ? 'bg-green-500' : 'bg-red-500'}`}
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
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
        <div>
          <Card>
            <CardContent className="p-4 text-white">
              <h2 className="text-xl font-semibold mb-4 text-white">Pick Ban Results</h2>
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
                        const dungeon = dungeonConfig.find((d) => d.id === id)
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
                        const dungeon = dungeonConfig.find((d) => d.id === id)
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
