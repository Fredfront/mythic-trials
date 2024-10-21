'use client'
import React from 'react'
import { useGetUserData } from '@/app/auth/useGetUserData'
import supabase from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Image from 'next/image'
import { urlForImage } from '../../../../../sanity/lib/image'
import PickBanV2 from './matches/PickBanV2'
import { InfoBoxComponent } from '@/components/info-box'
import { Match, TournamentSchedule } from '../../../../../types'
import { create_match_results, createPickBanRow, PickAndBansType, TMatchResults } from '../../../../../supabase/dbFunctions'

export function Matches({
  pickAndBansData,
  matchResults,
  sanityTeamData,
  schedule,
}: {
  pickAndBansData: PickAndBansType[]
  matchResults: TMatchResults[]
  sanityTeamData: MythicPlusTeam[]
  schedule: TournamentSchedule

})
{
  const { user } = useGetUserData()
  const email = user?.data.user?.email
  const myTeam = sanityTeamData.find((team) => team.contactPerson === email)

  const router = useRouter()

  const detailedSchedule = schedule as TournamentSchedule


  const [ matchData, setMatchData ] = React.useState<Match | null>(null)

  if (matchData && matchData.teams.length === 2 && email) {
    return (
      <>
        <div
          className="flex gap-1 cursor-pointer hover:font-bold p-2"
          onClick={() =>
          {
            setMatchData(null)
            router.push('/my-matches')
          }}
        >
          <ArrowLeft /> Gå tilbake
        </div>
        <PickBanV2
          sanityTeamData={sanityTeamData}
          matchData={matchData}
          pickAndBansTable={pickAndBansData as PickAndBansType[]}
          contact_person={email}
        />
      </>
    )
  }

  return (
    <div className=" ">
      <h1 className="text-4xl text-center font-bold mt-10">Mine kamper</h1>


      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-10 w-full m-auto max-w-7xl p-4">
        <InfoBoxComponent />

        {detailedSchedule.map((round, index) =>
        {
          return (
            <>
              <div key={round[ 0 ].teams[ 0 ].matchUUID + index} className="bg-gray-800 p-4 rounded-lg">
                <Accordion key={index} type="single" collapsible>
                  <h2 className="feed-header">Runde {index + 1}</h2>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      {round.map((match, matchIndex) =>
                      {
                        const matchUUID = `${match.teams?.[ 0 ].team_slug}-${match.teams?.[ 1 ].team_slug}-round-${match.teams?.[ 0 ].round}-roundDate-${match.teams?.[ 0 ].roundDate}`
                        const homeTeam = match.teams?.[ 0 ].team_slug
                        const awayTeam = match.teams?.[ 1 ].team_slug
                        const homeTeamName = match.teams?.[ 0 ].name
                        const awayTeamName = match.teams?.[ 1 ].name
                        const homeTeamImageUrl = sanityTeamData.find((e) => e.teamName === homeTeamName)?.teamImage
                          .asset._ref
                        const awayTeamImageUrl = sanityTeamData.find((e) => e.teamName === awayTeamName)?.teamImage
                          .asset._ref

                        const homeTeamMatchResults = matchResults?.find(
                          (result) => result.team_slug === homeTeam,
                        )
                        const awayTeamMatchResults = matchResults?.find(
                          (result) => result.team_slug === awayTeam,
                        )

                        const homeTeamWins = homeTeamMatchResults?.winner

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

                        const findMatch = match.teams.find((e) => e.contactPerson === email)

                        const opponent = match.teams.find(
                          (e) => e.round === findMatch?.round && e.matchUUID === findMatch?.matchUUID && e.team_slug !== findMatch?.team_slug,
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
                          pickAndBansData?.find(
                            (e) =>
                              e.round === payloadCreateNewPickBanRow.round &&
                              payloadCreateNewPickBanRow.contact_person === e.contact_person,
                          )?.completed === true

                        const matchResultsAreConfirmed =
                          matchResults?.find(
                            (e) =>
                              e.contact_person === payloadCreateNewPickBanRow.contact_person &&
                              e.round === payloadCreateNewPickBanRow.round,
                          )?.confirm === true


                        const oneWeekBeforePickBan = new Date(match.teams?.[ 0 ].roundDate)
                        oneWeekBeforePickBan.setDate(oneWeekBeforePickBan.getDate() - 7)
                        const today = new Date()

                        const hidePickBanButton = today > oneWeekBeforePickBan


                        if (match.teams?.[ 0 ].contactPerson !== email && match.teams?.[ 1 ].contactPerson !== email) {
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
                                    <div className=" text-xs">{match.teams?.[ 0 ].roundDate}</div>
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
                              {!hidePickBanButton && !pickBanCompleted ? (
                                <Button
                                  className=''
                                  onClick={async () =>
                                  {
                                    if (email) {
                                      await supabase
                                        .from('pick_ban')
                                        .select('*')
                                        .eq('contact_person', email)
                                        .eq('round', match.teams?.[ 0 ].round)
                                        .then((res) =>
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
                                    router.push('/my-matches?home=' + match.teams[ 0 ].team_slug + '&away=' + match.teams[ 1 ].team_slug)
                                  }}
                                >
                                  Gå til Pick/Ban
                                </Button>
                              ) : null}
                              {pickBanCompleted && !matchResultsAreConfirmed ? (
                                <Button
                                  onClick={async () =>
                                  {
                                    await supabase
                                      .from('match_results')
                                      .select('*')
                                      .eq('contact_person', email)
                                      .eq('round', match.teams[ 0 ].round)
                                      .then((res) =>
                                      {
                                        if (res.data && res.data.length === 0) {
                                          create_match_results({
                                            matchResults: {
                                              contact_person: email as string,
                                              opponent: myTeam?.teamSlug === homeTeam ? awayTeam : homeTeam,
                                              round: match.teams[ 0 ].round,
                                              team_slug: myTeam?.teamSlug as string,
                                              matchUUID,
                                            },
                                          })
                                        }
                                      })
                                      .then(() =>
                                      {
                                        router.push(
                                          '/my-matches/results?home=' +
                                          match.teams[ 0 ].team_slug +
                                          '&away=' +
                                          match.teams[ 1 ].team_slug +
                                          '&round=' +
                                          match.teams[ 0 ].round,
                                        )
                                      })
                                  }}
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


