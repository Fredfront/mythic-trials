'use client'
import React from 'react'
import { SupabaseTeamType, useGenerateRoundRobin } from '../../turnering/hooks/useGenerateRoundRobin'
import { useGetUserData } from '@/app/auth/useGetUserData'
import { TMatchData } from '../../turnering/components/Matches'
import PickBan from './matches/PickBan'
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import supabase from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TMatchResults } from '../results/components/Result'

export function Matches({
  teams,
  pickAndBansTable,
  matchResultsTable,
}: {
  teams: PostgrestSingleResponse<SupabaseTeamType[]>
  pickAndBansTable: PostgrestSingleResponse<PickAndBansType[]>
  matchResultsTable: PostgrestSingleResponse<TMatchResults[]>
})
{
  const { user } = useGetUserData()
  const email = user?.data.user?.email
  const sortedTeams = teams.data?.sort(
    (a: { points: number }, b: { points: number }) => a.points - b.points,
  ) as SupabaseTeamType[]

  const router = useRouter()

  const { detailedSchedule } = useGenerateRoundRobin(sortedTeams, email)

  const [ matchData, setMatchData ] = React.useState<TMatchData[] | null>(null)

  if (matchData && matchData.length === 2 && email) {
    return (
      <>
        <div
          className="flex gap-1 p-1 cursor-pointer hover:font-bold"
          onClick={() =>
          {
            setMatchData(null)
            router.push('/my-matches')
          }}
        >
          <ArrowLeft /> Go back
        </div>
        <PickBan
          matchData={matchData}
          pickAndBansTable={pickAndBansTable.data as PickAndBansType[]}
          contact_person={email}
        />
      </>
    )
  }

  return (
    <div className=" max-w-7xl  m-auto ">
      <h1 className="text-4xl text-center font-bold mt-10">Mine kamper</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {detailedSchedule.map((round: any, index: number) =>
        {
          return (
            <>
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-2xl text-center font-bold">Runde {index + 1}</h2>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {round.map((match: Match[], index: number) =>
                  {
                    const findMatch = match.find((e) => e.contactPerson === email)

                    const opponent = match.find(
                      (e) => e.round === findMatch?.round && e.contactPerson === undefined,
                    )?.team_slug

                    const payloadCreateNewPickBanRow = {
                      my_turn: findMatch?.home ? true : false,
                      round: findMatch?.round as number,
                      contact_person: email,
                      team_slug: findMatch?.team_slug as string,
                      opponent: opponent as string,
                      home: findMatch?.home as boolean,
                    }

                    const matchResults = matchResultsTable?.data?.find(
                      (e) =>
                        e.contact_person === payloadCreateNewPickBanRow.contact_person &&
                        e.round === payloadCreateNewPickBanRow.round,
                    )

                    const pickBanDataIsNotFound =
                      pickAndBansTable.data?.find(
                        (e) =>
                          e.round === payloadCreateNewPickBanRow.round &&
                          payloadCreateNewPickBanRow.contact_person === e.contact_person,
                      ) === undefined

                    const pickBanCompleted =
                      pickAndBansTable.data?.find(
                        (e) =>
                          e.round === payloadCreateNewPickBanRow.round &&
                          payloadCreateNewPickBanRow.contact_person === e.contact_person,
                      )?.completed === true

                    const matchResultsAreConfirmed =
                      matchResultsTable?.data?.find(
                        (e) =>
                          e.contact_person === payloadCreateNewPickBanRow.contact_person &&
                          e.round === payloadCreateNewPickBanRow.round,
                      )?.confirm === true

                    if (match[ 0 ].contactPerson === undefined && match[ 1 ].contactPerson === undefined) {
                      return null
                    }

                    return (
                      <>
                        <div key={index} className="bg-gray-700 p-4 rounded-lg">
                          <div className=" text-lg text-center">{match[ 0 ].name + ' vs ' + match[ 1 ].name}</div>
                        </div>

                        <div>
                          {!pickBanCompleted ? (
                            <Button
                              onClick={async () =>
                              {
                                if (email) {
                                  if (pickBanDataIsNotFound)
                                    createPickBanRow(
                                      payloadCreateNewPickBanRow.round,
                                      email,
                                      payloadCreateNewPickBanRow.team_slug,
                                      payloadCreateNewPickBanRow.opponent,
                                      payloadCreateNewPickBanRow.home,
                                    )
                                }

                                setMatchData(match)
                                router.push('/my-matches?home=' + match[ 0 ].name + '&away=' + match[ 1 ].name)
                              }}
                            >
                              Gå til Pick/Ban
                            </Button>
                          ) : null}
                          {pickBanCompleted && !matchResultsAreConfirmed ? (
                            <Button
                              onClick={() =>
                                router.push(
                                  '/my-matches/results?home=' +
                                  match[ 0 ].team_slug +
                                  '&away=' +
                                  match[ 1 ].team_slug +
                                  '&round=' +
                                  match[ 0 ].round,
                                )
                              }
                            >
                              Legg til resultat
                            </Button>
                          ) : null}
                        </div>
                      </>
                    )
                  })}
                </div>
              </div>
            </>
          )
        })}
      </div>
    </div>
  )
}

export type Match = {
  contactPerson: string
  home: boolean
  name: string
  round: number
  team_slug: string
  roundDate: string
}

export type PickAndBansType = {
  bans: number[]
  completed: boolean
  contact_person: string
  my_turn: boolean
  opponent: string
  pick: number
  ready: boolean
  round: number
  team_slug: string
  home: boolean
}

async function createPickBanRow(
  round: number,
  contact_person: string,
  team_slug: string,
  opponent: string,
  home: boolean,
)
{
  await supabase.from('pick_ban').insert([
    {
      contact_person,
      round,
      team_slug,
      bans: null,
      completed: false,
      my_turn: home ? false : true,
      opponent,
      pick: null,
      ready: false,
      home,
    },
  ])
}

type Match_results = {
  round: number
  contact_person: string
  team_slug: string
  opponent: string
  match_1: number
  match_2: number
  match_3: number
}

export async function create_match_results({ matchResults }: { matchResults: Match_results })
{
  await supabase.from('match_results').insert(matchResults)
}
