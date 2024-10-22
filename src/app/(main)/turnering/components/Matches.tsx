'use client'

import React from 'react'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { urlForImage } from '../../../../../sanity/lib/image'
import Image from 'next/image'
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'
import { AccordionTrigger } from '@radix-ui/react-accordion'
import { TournamentSchedule } from '../../../../../types'
import { PickAndBansType, TMatchResults } from '../../../../../supabase/dbFunctions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CalendarX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Matches({
  matchResults,
  sanityTeamData,
  schedule,
}: {
  pickAndBanData: PickAndBansType[]
  matchResults: TMatchResults[]
  sanityTeamData: MythicPlusTeam[]
  schedule: TournamentSchedule
})
{
  const detailedSchedule = schedule as TournamentSchedule

  if (!detailedSchedule || detailedSchedule.length === 0) {
    return (
      <div className="flex justify-center items-center p-4">
        <Card className="w-full max-w-md text-whit">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center text-white">
              <CalendarX color="white" className="mr-2" />
              Ingen kampplan tilgjengelig
            </CardTitle>
          </CardHeader>
          <CardContent className="text-whit">
            <p className="text-center text-white">
              Det er for øyeblikket ingen detaljert kampplan tilgjengelig. Vennligst sjekk igjen senere for
              oppdateringer.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-10 w-full m-auto max-w-7xl p-4">
        {detailedSchedule.map((round, index: number) => (
          <Accordion key={index} type="single" collapsible>
            <h2 className="feed-header">Runde {index + 1}</h2>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-4 mt-4">
                {round.map((match, matchIndex) =>
                {
                  const homeTeam = match.teams?.[ 0 ].team_slug
                  const awayTeam = match.teams?.[ 1 ].team_slug
                  const homeTeamName = match.teams?.[ 0 ].name
                  const awayTeamName = match.teams?.[ 1 ].name
                  const homeTeamImageUrl = sanityTeamData.find((e) => e.teamName === homeTeamName)?.teamImage.asset._ref
                  const awayTeamImageUrl = sanityTeamData.find((e) => e.teamName === awayTeamName)?.teamImage.asset._ref

                  const homeTeamMatchResults = matchResults.find((result) => result.team_slug === homeTeam)
                  const awayTeamMatchResults = matchResults.find((result) => result.team_slug === awayTeam)

                  const homeTeamWins = homeTeamMatchResults?.winner

                  const homeTeamScoreMatchOne = homeTeamMatchResults?.match_1 || 0
                  const awayTeamScoreMatchOne = awayTeamMatchResults?.match_1 || 0

                  const homeTeamScoreMatchTwo = homeTeamMatchResults?.match_2 || 0
                  const awayTeamScoreMatchTwo = awayTeamMatchResults?.match_2 || 0

                  const homeTeamScoreMatchThree = homeTeamMatchResults?.match_3 || 0
                  const awayTeamScoreMatchThree = awayTeamMatchResults?.match_3 || 0

                  const totalHomeTeamScore = homeTeamScoreMatchOne + homeTeamScoreMatchTwo + homeTeamScoreMatchThree
                  const totalAwayTeamScore = awayTeamScoreMatchOne + awayTeamScoreMatchTwo + awayTeamScoreMatchThree

                  const confirmedResult =
                    homeTeamMatchResults?.confirm &&
                      awayTeamMatchResults?.confirm &&
                      homeTeamMatchResults.round === index + 1 &&
                      awayTeamMatchResults.round === index + 1
                      ? true
                      : false

                  const matchDate = match.teams[ 0 ].roundDate
                  const matchStartTime = match.teams[ 0 ].round_startTime
                  const rescheduledDate = match.teams[ 0 ].rescheduled_round_date
                  const rescheduledStartTime = match.teams[ 0 ].rescheduled_round_startTime
                  const rescheduledDateTime = new Date(`${rescheduledDate}T${rescheduledStartTime}Z`)
                  const rescheduledDateTimeString = rescheduledDateTime.toLocaleString('nb-NO', {
                    timeZone: 'UTC',
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                  const hasRescheduled = match.teams[ 0 ].rescheduled

                  //Convert to Oslo time and to a readable format
                  const matchDateTime = new Date(`${matchDate}T${matchStartTime}Z`)
                  const matchDateTimeString = matchDateTime.toLocaleString('nb-NO', {
                    timeZone: 'UTC',
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })

                  return (
                    <AccordionItem key={matchIndex} value={matchIndex.toString()}>
                      <AccordionTrigger className="bg-gray-700 p-4 w-full rounded-lg  transition  ease-in-out cursor-pointer font-bold match_result_main_div ">
                        <div className="flex relative ">
                          {match.featured ? (
                            <div className="hidden md:flex absolute top-0 left-0">
                              <Badge>Featured</Badge>
                            </div>
                          ) : null}

                          <div className="flex w-2/5 md:w-[40%] text-right justify-end">
                            <div className="flex-col text-ellipsis overflow-hidden text-nowrap truncate ">
                              {confirmedResult ? (
                                <div className={`text-sm ${homeTeamWins ? 'text-[#40b3a1]' : ' text-red-600'}`}>
                                  {homeTeamWins ? 'Vinner' : 'Taper'}
                                </div>
                              ) : null}
                              <div className={!confirmedResult ? 'mt-3 text-xs md:text-lg' : 'text-xs md:text-lg'}>
                                {homeTeamName}
                              </div>
                            </div>
                            <div className="ml-4 mr-4 ">
                              <Image
                                src={homeTeamImageUrl ? urlForImage(homeTeamImageUrl) : '/Logo.png'}
                                alt={`${homeTeam} logo`}
                                width={45}
                                height={45}
                                className="hidden md:block  mr-0 md:w-12 md:h-12 w-10 h-10 border-[#FDB202] border-2 rounded-full"
                              />
                            </div>
                          </div>
                          <div className=" w-2/5 md:w-[25%] ">
                            <div className=" text-xs flex flex-col">
                              <div className=" text-xs flex flex-col"><span className={`${hasRescheduled && rescheduledDateTimeString ? 'line-through' : ''}`}>{matchDateTimeString}</span>{hasRescheduled && <span>Ny tid: {rescheduledDateTimeString}</span>}</div>

                            </div>
                            {confirmedResult ? (
                              <div>
                                {totalHomeTeamScore} - {totalAwayTeamScore}
                              </div>
                            ) : (
                              <div className="mt-1">TBD </div>
                            )}
                          </div>
                          <div className="flex w-2/5 md:w-[40%] text-left">
                            <div className="ml-4 mr-4">
                              <Image
                                src={awayTeamImageUrl ? urlForImage(awayTeamImageUrl) : '/Logo.png'}
                                alt={`${homeTeam} logo`}
                                width={45}
                                height={45}
                                className="hidden md:block md:w-12 md:h-12  w-10 h-10  border-[#ff5a00] border-2 rounded-full"
                              />
                            </div>
                            <div className="flex-col text-ellipsis overflow-hidden text-nowrap truncate ">
                              {confirmedResult ? (
                                <div className={`text-sm ${!homeTeamWins ? 'text-[#40b3a1]' : ' text-red-600'}`}>
                                  {!homeTeamWins ? 'Vinner' : 'Taper'}
                                </div>
                              ) : null}
                              <div className={!confirmedResult ? 'mt-3 text-xs md:text-lg' : 'text-xs md:text-lg'}>
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
                  )
                })}
              </div>
            </div>
          </Accordion>
        ))}
      </div>
    </>
  )
}
