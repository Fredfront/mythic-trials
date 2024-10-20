'use client'
import React from 'react'
import { SupabaseTeamType, useGenerateRoundRobin } from '../../turnering/hooks/useGenerateRoundRobin'
import { useGetUserData } from '@/app/auth/useGetUserData'
import { TMatchData } from '../../turnering/components/Matches'
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import supabase from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TMatchResults } from '../results/components/Result'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Image from 'next/image'
import { urlForImage } from '../../../../../sanity/lib/image'
import PickBanV2 from './matches/PickBanV2'

export function Matches({
  teams,
  pickAndBansTable,
  matchResultsTable,
  sanityTeamData,
}: {
  teams: PostgrestSingleResponse<SupabaseTeamType[]>
  pickAndBansTable: PostgrestSingleResponse<PickAndBansType[]>
  matchResultsTable: PostgrestSingleResponse<TMatchResults[]>
  sanityTeamData: MythicPlusTeam[]
})
{
  const { user } = useGetUserData()
  const email = user?.data.user?.email
  const sortedTeams = teams.data?.sort(
    (a: { points: number }, b: { points: number }) => a.points - b.points,
  ) as SupabaseTeamType[]

  const myTeam = sanityTeamData.find((team) => team.contactPerson === email)

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
        <PickBanV2
          sanityTeamData={sanityTeamData}
          matchData={matchData}
          pickAndBansTable={pickAndBansTable.data as PickAndBansType[]}
          contact_person={email}
        />
      </>
    )
  }

  return (
    <div className=" ">
      <h1 className="text-4xl text-center font-bold mt-10">Mine kamper</h1>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-10 w-full m-auto max-w-7xl p-4">
        {detailedSchedule.map((round: any, index: number) =>
        {
          return (
            <>
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <Accordion key={index} type="single" collapsible>
                  <h2 className="feed-header">Runde {index + 1}</h2>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      {round.map((match: Match[], matchIndex: number) =>
                      {

                        const matchUUID = `${match[ 0 ].team_slug}-${match[ 1 ].team_slug}-round-${match[ 0 ].round}-roundDate-${match[ 0 ].roundDate}`
                        const homeTeam = match[ 0 ].team_slug
                        const awayTeam = match[ 1 ].team_slug
                        const homeTeamName = match[ 0 ].name
                        const awayTeamName = match[ 1 ].name
                        const homeTeamImageUrl = sanityTeamData.find((e) => e.teamName === homeTeamName)?.teamImage
                          .asset._ref
                        const awayTeamImageUrl = sanityTeamData.find((e) => e.teamName === awayTeamName)?.teamImage
                          .asset._ref

                        const homeTeamMatchResults = matchResultsTable?.data?.find(
                          (result) => result.team_slug === homeTeam,
                        )
                        const awayTeamMatchResults = matchResultsTable?.data?.find(
                          (result) => result.team_slug === awayTeam,
                        )

                        const homeTeamWins = homeTeamMatchResults?.winner
                        const awayTeamWins = awayTeamMatchResults?.winner

                        const homeTeamScoreMatchOne = homeTeamMatchResults?.match_1 || 0
                        const awayTeamScoreMatchOne = awayTeamMatchResults?.match_1 || 0

                        const homeTeamScoreMatchTwo = homeTeamMatchResults?.match_2 || 0
                        const awayTeamScoreMatchTwo = awayTeamMatchResults?.match_2 || 0

                        const homeTeamScoreMatchThree = homeTeamMatchResults?.match_3 || 0
                        const awayTeamScoreMatchThree = awayTeamMatchResults?.match_3 || 0

                        const totalHomeTeamScore =
                          homeTeamScoreMatchOne + homeTeamScoreMatchTwo + homeTeamScoreMatchThree
                        const totalAwayTeamScore =
                          awayTeamScoreMatchOne + awayTeamScoreMatchTwo + awayTeamScoreMatchThree

                        const confirmedResult =
                          homeTeamMatchResults?.confirm &&
                            awayTeamMatchResults?.confirm &&
                            homeTeamMatchResults.round === index + 1 &&
                            awayTeamMatchResults.round === index + 1
                            ? true
                            : false

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
                            <AccordionItem key={matchIndex} value={matchIndex.toString()}>
                              <AccordionTrigger className="bg-gray-700 p-4 w-full rounded-lg  transition  ease-in-out cursor-pointer font-bold match_result_main_div ">
                                <div className="flex  w-full ">
                                  <div className="flex w-2/5 md:w-[40%] text-right justify-end">
                                    <div className="flex-col text-ellipsis overflow-hidden text-nowrap truncate ">
                                      {confirmedResult ? (
                                        <div className={`text-sm ${homeTeamWins ? 'text-[#40b3a1]' : ' text-red-600'}`}>
                                          {homeTeamWins ? 'Vinner' : 'Taper'}
                                        </div>
                                      ) : null}
                                      <div
                                        className={!confirmedResult ? 'mt-3 text-xs md:text-lg' : 'text-xs md:text-lg'}
                                      >
                                        {homeTeamName}
                                      </div>
                                    </div>
                                    <div className="ml-2 ">
                                      <Image
                                        src={homeTeamImageUrl ? urlForImage(homeTeamImageUrl) : '/Logo.png'}
                                        alt={`${homeTeam} logo`}
                                        width={45}
                                        height={45}
                                        className="mr-0 md:w-12 md:h-12 w-10 h-10 border-[#FDB202] border-2 rounded-full"
                                      />
                                    </div>
                                  </div>
                                  <div className=" w-1/5 md:w-[15%] ">
                                    <div className=" text-xs">{match[ 0 ].roundDate}</div>
                                    {confirmedResult ? (
                                      <div>
                                        {totalHomeTeamScore} - {totalAwayTeamScore}
                                      </div>
                                    ) : (
                                      <div>TBD </div>
                                    )}
                                  </div>
                                  <div className="flex w-2/5 md:w-[40%] text-left">
                                    <div className="mr-2">
                                      <Image
                                        src={awayTeamImageUrl ? urlForImage(awayTeamImageUrl) : '/Logo.png'}
                                        alt={`${homeTeam} logo`}
                                        width={45}
                                        height={45}
                                        className="md:w-12 md:h-12  w-10 h-10  border-[#ff5a00] border-2 rounded-full"
                                      />
                                    </div>
                                    <div className="flex-col text-ellipsis overflow-hidden text-nowrap truncate ">
                                      {confirmedResult ? (
                                        <div
                                          className={`text-sm ${!homeTeamWins ? 'text-[#40b3a1]' : ' text-red-600'}`}
                                        >
                                          {!homeTeamWins ? 'Vinner' : 'Taper'}
                                        </div>
                                      ) : null}
                                      <div
                                        className={!confirmedResult ? 'mt-3 text-xs md:text-lg' : 'text-xs md:text-lg'}
                                      >
                                        {awayTeamName}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="p-4">{/* Additional match details can be added here */}</div>
                              </AccordionContent>
                            </AccordionItem>

                            <div>
                              {!pickBanCompleted ? (
                                <Button
                                  onClick={async () =>
                                  {
                                    if (email) {
                                      await supabase.from('pick_ban').select('*').eq('contact_person', email).eq('round', match[ 0 ].round).then((res) =>
                                      {
                                        if (res.data && res.data.length === 0) {
                                          createPickBanRow(
                                            payloadCreateNewPickBanRow.round,
                                            email,
                                            payloadCreateNewPickBanRow.team_slug,
                                            payloadCreateNewPickBanRow.opponent,
                                            payloadCreateNewPickBanRow.home,
                                            matchUUID,
                                          )
                                        }
                                      })
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
                                  onClick={async () =>
                                  {
                                    await supabase.from('match_results').select('*').eq('contact_person', email).eq('round', match[ 0 ].round).then((res) =>
                                    {
                                      if (res.data && res.data.length === 0) {
                                        create_match_results({
                                          matchResults: {
                                            contact_person: email as string,
                                            opponent: myTeam?.teamSlug === homeTeam ? awayTeam : homeTeam,
                                            round: match[ 0 ].round,
                                            team_slug: myTeam?.teamSlug as string,
                                            matchUUID,
                                          }
                                        })
                                      }
                                    })
                                      .then(() =>
                                      {
                                        router.push(
                                          '/my-matches/results?home=' +
                                          match[ 0 ].team_slug +
                                          '&away=' +
                                          match[ 1 ].team_slug +
                                          '&round=' +
                                          match[ 0 ].round,
                                        )
                                      })
                                  }
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
                </Accordion>
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
  step: number
  id: number
}

export async function createPickBanRow(
  round: number,
  contact_person: string,
  team_slug: string,
  opponent: string,
  home: boolean,
  matchUUID: string,
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
      step: home ? 2 : 1,
      matchUUID,
    },
  ])
}

type Match_results = {
  round: number
  contact_person: string
  team_slug: string
  opponent: string
  match_1?: number | null
  match_2?: number | null
  match_3?: number | null
  confirm?: boolean
  winner?: boolean
  matchUUID: string
}

export async function create_match_results({ matchResults }: { matchResults: Match_results })
{
  await supabase.from('match_results').insert(matchResults)
}


