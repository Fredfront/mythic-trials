'use client'
import { useGetUserData } from '@/app/auth/useGetUserData'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'
import { PickAndBansType } from '../../components/Matches'
import { dungeonConfig } from '@/app/(main)/turnering/utils/dungeonConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import supabase from '@/utils/supabase/client'
import { ArrowRight } from 'lucide-react'
import { route } from 'sanity/router'

export default function Result({
  pickAndBanData,
  teams,
  matchResults,
}: {
  pickAndBanData: PickAndBansType[]
  teams: TTeam[]
  matchResults: TMatchResults[]
})
{
  const router = useRouter()

  const round = parseInt(useSearchParams().get('round') || '0')
  const home_team = useSearchParams().get('home')
  const away_team = useSearchParams().get('away')
  const { user, loading } = useGetUserData()
  const myTeam = teams.find((e) => e.contact_person === user?.data.user?.email)
  const homeAndAwayTeam = [ home_team, away_team ]
  const opponentTeam = homeAndAwayTeam.find((e) => e !== myTeam?.team_slug)
  const contact_person = user?.data.user?.email
  const opponent_contact_person = teams.find((e) => e.team_slug === opponentTeam)?.contact_person

  const myMatchResults = matchResults.find((e) => e.contact_person === contact_person && e.round === round)
  const opponentMatchResults = matchResults.find(
    (e) => e.contact_person === opponent_contact_person && e.round === round,
  )

  useEffect(() =>
  {
    if (myMatchResults || loading) return
    if (contact_person && round && opponentTeam && myTeam?.team_slug)
      createMatchResultsRow(round, contact_person, myTeam?.team_slug, opponentTeam)
  }, [ contact_person, loading, myMatchResults, myTeam?.team_slug, opponentTeam, round ])


  //get team names
  const home_team_name = useMemo(() => teams.find((e) => e.team_slug === home_team)?.name, [ home_team, teams ])
  const away_team_name = useMemo(() => teams.find((e) => e.team_slug === away_team)?.name, [ away_team, teams ])

  //state for my maps
  const [ myMap1, setMyMap1Result ] = React.useState<number | undefined>(myMatchResults?.match_1 ? myMatchResults?.match_1 : opponentMatchResults?.match_1 === 1 ? 0 : 1)
  const [ myMap2, setMyMap2Result ] = React.useState<number | undefined>(myMatchResults?.match_2 ? myMatchResults?.match_2 : opponentMatchResults?.match_2 === 1 ? 0 : 1)
  const [ myMap3, setMyMap3Result ] = React.useState<number | undefined>(myMatchResults?.match_3 ? myMatchResults?.match_3 : opponentMatchResults?.match_3 === 1 ? 0 : 1)

  //state for opponent maps - should listen to Websocket
  const [ opponentMap1, setOpponentMap1Result ] = React.useState<number | undefined>(opponentMatchResults?.match_1 ?? undefined)
  const [ opponentMap2, setOpponentMap2Result ] = React.useState<number | undefined>(opponentMatchResults?.match_2 ?? undefined)
  const [ opponentMap3, setOpponentMap3Result ] = React.useState<number | undefined>(opponentMatchResults?.match_3 ?? undefined)

  //Both teams need to confirm results
  const [ confirm, setConfirm ] = React.useState<boolean>(myMatchResults?.confirm ?? false)
  const [ confirmOpponent, setConfirmOpponent ] = React.useState<boolean>(opponentMatchResults?.confirm ?? false)

  useEffect(() =>
  {
    if (loading) return
    if (myMatchResults?.match_2 && myMap2 === null) setMyMap2Result(myMatchResults?.match_2)
    if (myMatchResults?.match_3 && myMap3 === null) setMyMap3Result(myMatchResults?.match_3)
    if (myMatchResults?.match_1 && myMap1 === null) setMyMap1Result(myMatchResults?.match_1)
  }, [ loading, myMap1, myMap2, myMap3, myMatchResults?.match_1, myMatchResults?.match_2, myMatchResults?.match_3 ])

  const my_pick_ban_data = useMemo(
    () => pickAndBanData.find((data) => data.round === round && data.contact_person === user?.data.user?.email),
    [ pickAndBanData, round, user?.data.user?.email ],
  )

  const opponent_pick_ban_data = useMemo(
    () =>
      pickAndBanData.find(
        (data) =>
          data.round === round &&
          data.contact_person !== user?.data.user?.email &&
          data.team_slug === my_pick_ban_data?.opponent,
      ),
    [ my_pick_ban_data?.opponent, pickAndBanData, round, user?.data.user?.email ],
  )

  const bannedMaps = useMemo(
    () =>
      my_pick_ban_data?.bans
        .concat(opponent_pick_ban_data?.bans ?? [])
        .concat(my_pick_ban_data?.pick ?? [])
        .concat(opponent_pick_ban_data?.pick ?? []),
    [ my_pick_ban_data?.bans, my_pick_ban_data?.pick, opponent_pick_ban_data?.bans, opponent_pick_ban_data?.pick ],
  )

  const map_1_id = useMemo(
    () => (my_pick_ban_data?.team_slug === home_team ? my_pick_ban_data?.pick : opponent_pick_ban_data?.pick),
    [ home_team, my_pick_ban_data?.pick, my_pick_ban_data?.team_slug, opponent_pick_ban_data?.pick ],
  )
  const map_2_id = useMemo(
    () => (my_pick_ban_data?.team_slug === home_team ? opponent_pick_ban_data?.pick : my_pick_ban_data?.pick),
    [ home_team, my_pick_ban_data?.pick, my_pick_ban_data?.team_slug, opponent_pick_ban_data?.pick ],
  )

  const map_1 = useMemo(() => dungeonConfig.find((e) => e.id === map_1_id), [ map_1_id ])
  const map_2 = useMemo(() => dungeonConfig.find((e) => e.id === map_2_id), [ map_2_id ])
  const map_3 = useMemo(() => dungeonConfig.find((e) => !bannedMaps?.includes(e.id)), [ bannedMaps ])

  const allMaps = [ map_1, map_2, map_3 ]

  const winner = myMap1 && myMap2 && myMap1 + myMap2 + (myMap3 ?? 0) === 2 ? true : false

  useEffect(() =>
  {
    const channel = supabase
      .channel('pick_ban')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'match_results',
        },
        (payload) =>
        {
          console.log('Change received!', payload.new)
          const newPayload = payload.new as TMatchResults

          if (newPayload.contact_person === contact_person && newPayload.round === round) {
            setMyMap1Result(newPayload.match_1 ?? undefined)
            setMyMap2Result(newPayload.match_2 ?? undefined)
            setMyMap3Result(newPayload.match_3 ?? undefined)
            setConfirm(newPayload.confirm)
          }

          if (newPayload.contact_person === opponent_contact_person && newPayload.round === round) {
            setOpponentMap1Result(newPayload.match_1 ?? undefined)
            setOpponentMap2Result(newPayload.match_2 ?? undefined)
            setOpponentMap3Result(newPayload.match_3 ?? undefined)
            setConfirmOpponent(newPayload.confirm)
          }
        },
      )
      .subscribe()

    return () =>
    {
      supabase.removeChannel(channel)
    }
  }, [ contact_person, opponent_contact_person, round ])

  if (confirmOpponent && confirm) {
    return <div className="text-center mt-10 ">
      <h3 className='text-4xl font-bold'>Resultat godkjent</h3>
      <div className='flex justify-center '>
        <Button onClick={() => router.push('/turnering')} className='mt-[100px]'>Gå til resultater <ArrowRight /></Button>
      </div>
    </div>
  }

  if (loading) return <div>Loading...</div>

  if (!loading && !user?.data.user?.email) {
    router.push('/')
  }

  return (
    <div>
      <div onClick={() => router.push('/my-matches')}>Gå tilbake</div>
      <div className="w-full flex  flex-col mt-10 ">
        <div className="text-center text-xl font-bold">
          {home_team_name} vs {away_team_name}
        </div>

        {allMaps.map((e, index) =>
        {
          let headline = ''

          const myValue = index === 0 ? myMap1 : index === 1 ? myMap2 : myMap3
          const opponentValue = index === 0 ? opponentMap1 : index === 1 ? opponentMap2 : opponentMap3

          const myValueConverted = myValue === 1 ? 'win' : myValue === 0 ? 'lose' : 'Ingen resultat'
          const opponentValueConverted = opponentValue === 1 ? 'win' : opponentValue === 0 ? 'lose' : ''

          const setMyValue = index === 0 ? setMyMap1Result : index === 1 ? setMyMap2Result : setMyMap3Result

          if (index === 0) headline = 'Map 1'
          if (index === 1) headline = 'Map 2'
          if (index === 2) headline = 'Map 3'

          if (
            (opponentMap1 !== null && opponentMap2 !== null && opponentMap1 === opponentMap2 && index === 2) ||
            (myMap1 !== null && myMap2 !== null && myMap1 === myMap2 && index === 2)
          )
            return null

          return (
            <>
              <div className="flex flex-col items-center w-full p-4 space-y-6  ">
                <div className="w-full max-w-2xl p-6 rounded-lg  shadow">
                  <div className="mb-4 font-bold">
                    {headline} ({e?.name})
                  </div>
                  <div className="grid grid-cols-2 gap-4 ">
                    <div>
                      <label
                        className="block mb-2 text-sm font-medium text-gray-700"
                        htmlFor={`map${index + 1}-my-score`}
                      >
                        Mitt resultat
                      </label>
                      <Select
                        disabled={confirm}
                        value={myValueConverted}
                        onValueChange={(e) =>
                        {
                          if (contact_person) {
                            setMyValue(e === 'win' ? 1 : 0)
                            updateMatchResults(contact_person, round, e === 'win' ? 1 : 0, index + 1)
                          }
                        }}
                      >
                        <SelectTrigger id={`map${index + 1}-my-score`}>
                          <SelectValue placeholder="Velg resultat for ditt lag" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="win">Vinn</SelectItem>
                          <SelectItem value="lose">Tap</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        className="block mb-2 text-sm font-medium text-gray-700"
                        htmlFor={`map${index + 1}-opponent-score`}
                      >
                        Motstander resultat
                      </label>
                      <Input
                        value={
                          opponentValueConverted === 'win' ? 'Vinn' : opponentValueConverted === 'lose' ? 'Tap' : ''
                        }
                        disabled
                        id={`map${index + 1}-opponent-score`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        })}
      </div>
      <div className="flex flex-col items-center w-full p-4 space-y-6">
        <p>Begge lag må godkjenne resultatene for a poeng skal bli tildelt. Må gjøres maks 24t etter endt runde.</p>

        <Button
          className={`${confirm ? 'bg-green-500' : 'white'} mt-2`}
          onClick={() =>
          {
            if (!contact_person) return
            setConfirm(!confirm)
            confirmMatchResults(contact_person, round, !confirm, winner)
          }}
        >
          Confirm results
        </Button>
        {confirmOpponent ? (
          <p className="mt-2 text-sm text-green-500">Opponent has confirmed results</p>
        ) : (
          <p className="mt-2 text-sm text-red-600">Motstander har ikke godkjent resultat enda</p>
        )}
      </div>
    </div>
  )
}

export type TMatchResults = {
  contact_person: string
  id: number
  match_1: number | null
  match_2: number | null
  match_3: number | null
  opponent: string
  round: number
  team_slug: string
  confirm: boolean
  winner: boolean
}

export type TTeam = {
  contact_person: string
  id: number
  name: string
  points: number
  team_slug: string
}

async function confirmMatchResults(contact_person: string, round: number, confirm: boolean, winner: boolean)
{
  const { data, error } = await supabase
    .from('match_results')
    .update({ confirm: confirm, winner: winner })
    .eq('contact_person', contact_person)
    .eq('round', round)

  if (error) {
    console.error(error)
    return error
  }
}

async function updateMatchResults(contact_person: string, round: number, result: number, match: number)
{
  let payload = {}
  if (match === 1) {
    payload = {
      match_1: result,
    }
  }

  if (match === 2) {
    payload = {
      match_2: result,
    }
  }

  if (match === 3) {
    payload = {
      match_3: result,
    }
  }

  const { error } = await supabase
    .from('match_results')
    .update(payload)
    .eq('contact_person', contact_person)
    .eq('round', round)

  if (error) {
    console.error(error)
    return error
  }
}

async function createMatchResultsRow(round: number, contact_person: string, team_slug: string, opponent: string)
{
  await supabase.from('match_results').insert([
    {
      contact_person: contact_person,
      round: round,
      team_slug: team_slug,
      opponent: opponent,
      match_1: null,
      match_2: null,
      match_3: null,
      confirm: false,
    },
  ])
}