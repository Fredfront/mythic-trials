'use client'

import React from 'react'
import { useGenerateRoundRobin } from '../hooks/useGenerateRoundRobin'
import { Match, PickAndBansType } from '../../my-matches/components/Matches'
import { TMatchResults, TTeam } from '../../my-matches/results/components/Result'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { urlForImage } from '../../../../../sanity/lib/image'
import Image from 'next/image'
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'
import { AccordionTrigger } from '@radix-ui/react-accordion'
import { useGetUserData } from '@/app/auth/useGetUserData'

export type TMatchData = {
  name: string
  contactPerson: string
  team_slug: string
  round: number
  home: boolean
}

export default function Matches({
  pickAndBanData,
  teams,
  matchResults,
  sanityTeamData,
}: {
  pickAndBanData: PickAndBansType[]
  teams: TTeam[]
  matchResults: TMatchResults[]
  sanityTeamData: MythicPlusTeam[]
})
{
  const { user } = useGetUserData()
  const myTeam = teams.find((team) => team.contact_person === user?.data.user?.email)

  const { detailedSchedule } = useGenerateRoundRobin(teams, '')

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-10 w-full m-auto max-w-7xl p-4">
        {detailedSchedule.map((round: any, index: number) => (
          <Accordion key={index} type="single" collapsible>
            <h2 className="feed-header">Runde {index + 1}</h2>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-4 mt-4">
                {round.map((match: Match[], matchIndex: number) =>
                {
                  console.log(round)

                  if (match[ 0 ].team_slug !== myTeam?.team_slug && match[ 1 ].team_slug !== myTeam?.team_slug) return null

                  const homeTeam = match[ 0 ].team_slug
                  const awayTeam = match[ 1 ].team_slug
                  const homeTeamName = match[ 0 ].name
                  const awayTeamName = match[ 1 ].name
                  const homeTeamImageUrl = sanityTeamData.find((e) => e.teamName === homeTeamName)?.teamImage.asset._ref
                  const awayTeamImageUrl = sanityTeamData.find((e) => e.teamName === awayTeamName)?.teamImage.asset._ref

                  const homeTeamMatchResults = matchResults.find((result) => result.team_slug === homeTeam)
                  const awayTeamMatchResults = matchResults.find((result) => result.team_slug === awayTeam)

                  const homeTeamWins = homeTeamMatchResults?.winner
                  const awayTeamWins = awayTeamMatchResults?.winner

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

                  return (
                    <AccordionItem key={matchIndex} value={matchIndex.toString()}>
                      <AccordionTrigger className="bg-gray-700 p-4 w-full rounded-lg  transition  ease-in-out cursor-pointer font-bold match_result_main_div ">
                        <div className="flex  ">
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
