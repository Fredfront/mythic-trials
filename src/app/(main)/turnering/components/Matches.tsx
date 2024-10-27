'use client'

import React from 'react'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { urlForImage } from '../../../../../sanity/lib/image'
import Image from 'next/image'
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'
import { AccordionTrigger } from '@radix-ui/react-accordion'
import { TournamentSchedule } from '../../../../../types'
import { PickAndBansType, TMatchResults } from '../../../../supabase/dbFunctions'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { CalendarX, Circle, ExternalLink, TwitchIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TeamLiveStatus } from '@/lib/twitch'
import { dungeonConfig, dungeonConfigType } from '../utils/dungeonConfig'
import { Separator } from '@/components/ui/separator'
import { match } from 'assert'
import { Button } from '@/components/ui/button'
import WarcraftLogsCards from '@/components/ui/warcraft-logs-cards'

export default function Matches({
  matchResults,
  sanityTeamData,
  schedule,
  teamsWithLiveChannels,
  pickAndBanData
}: {
  pickAndBanData: PickAndBansType[]
  matchResults: TMatchResults[]
  sanityTeamData: MythicPlusTeam[]
  schedule: TournamentSchedule
  teamsWithLiveChannels: TeamLiveStatus[]
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


                  const homTeamTwitchChannels = teamsWithLiveChannels.find((team) => team.teamSlug === homeTeam)?.twitch_channels || []
                  const awayTeamTwitchChannels = teamsWithLiveChannels.find((team) => team.teamSlug === awayTeam)?.twitch_channels || []

                  const hasMatchResults = matchResults.find((e) => e.round === index + 1 && homeTeam === e.team_slug && e.match_1 !== null && e.match_2 !== null)

                  const matchOneName = dungeonConfig.find((e) => e.id === pickAndBanData.find((e) => e.round === index + 1 && e.team_slug === match.teams[ 1 ].team_slug)?.pick)?.name
                  const matchTwoName = dungeonConfig.find((e) => e.id === pickAndBanData.find((e) => e.round === index + 1 && e.team_slug === match.teams[ 0 ].team_slug)?.pick)?.name
                  const homeTeamBans = pickAndBanData.find((e) => e.round === index + 1 && e.team_slug === match.teams[ 0 ].team_slug)?.bans || []
                  const awayTeamBans = pickAndBanData.find((e) => e.round === index + 1 && e.team_slug === match.teams[ 1 ].team_slug)?.bans || []
                  const hasTieBreaker = matchResults.find((e) => e.round === index + 1 && homeTeam === e.team_slug)?.match_3 !== null
                  const allBans = [ ...homeTeamBans, ...awayTeamBans ]
                  const homeTeamPick = pickAndBanData.find((e) => e.round === index + 1 && e.team_slug === match.teams[ 0 ].team_slug)?.pick || 0
                  const awayTeamPick = pickAndBanData.find((e) => e.round === index + 1 && e.team_slug === match.teams[ 1 ].team_slug)?.pick || 0

                  const combinedPickAndBans = [ ...homeTeamBans, ...awayTeamBans, homeTeamPick, awayTeamPick ] as number[]

                  const tieBreaker = hasTieBreaker ? dungeonConfig.find((e) => e.id === findMissingIds(dungeonConfig, combinedPickAndBans)) : null

                  const allBansmapped = allBans.map((ban) =>
                  {
                    return {
                      name: dungeonConfig.find((e) => e.id === ban)?.name,
                      image: dungeonConfig.find((e) => e.id === ban)?.image,
                    }
                  })

                  const allTwitchChannels = [ ...homTeamTwitchChannels, ...awayTeamTwitchChannels ]



                  return (
                    <AccordionItem key={matchIndex} value={matchIndex.toString()}>
                      <AccordionTrigger className="bg-gray-700 p-4 w-full rounded-lg  min-h-[100px]  transition  ease-in-out cursor-pointer font-bold match_result_main_div ">
                        <div className="flex relative ">
                          {match.featured ? (
                            <div className="hidden md:flex absolute top-0 left-0  -mt-4 ">
                              <Badge>Featured</Badge>
                            </div>
                          ) : null}
                          {hasRescheduled && (
                            <Badge className="hidden md:flex  absolute right-0 top-0 -mt-2 ">
                              Kamp flyttet
                            </Badge>
                          )}
                          {!match.featured && homTeamTwitchChannels && homTeamTwitchChannels.length > 0 || !match.featured && awayTeamTwitchChannels && awayTeamTwitchChannels.length > 0 ? (
                            <div className={`hidden md:flex absolute top-0 ${hasRescheduled ? 'left-0' : 'right-0'} -mt-4 items-center gap-2 `}>
                              Live <Circle width={10} height={10} fill='red' />
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
                              <div className=" text-xs flex flex-col">
                                <span
                                  className={`${hasRescheduled && rescheduledDateTimeString ? 'line-through' : ''}`}
                                >
                                  {matchDateTimeString}
                                </span>
                                {hasRescheduled && <span>Ny tid: {rescheduledDateTimeString}</span>}
                              </div>
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
                      <AccordionContent className="bg-gray-800 rounded-b-lg">
                        {(homTeamTwitchChannels.length > 0 || awayTeamTwitchChannels.length > 0) && (
                          <Card className="bg-gray-700 border-none mt-2">
                            <CardHeader>
                              <CardTitle className="text-lg font-semibold text-white">Live Streams</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {homTeamTwitchChannels.length > 0 && (
                                <div>
                                  <h3 className="text-sm font-medium mb-2 text-white">{match.teams[ 0 ].name} Streams</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {homTeamTwitchChannels.map((channel, index) => (
                                      <TwitchButton key={index} channel={channel} />
                                    ))}
                                  </div>
                                </div>
                              )}
                              {awayTeamTwitchChannels.length > 0 && (
                                <div>
                                  <h3 className="text-sm font-medium mb-2 text-white">{match.teams[ 1 ].name} Streams</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {awayTeamTwitchChannels.map((channel, index) => (
                                      <TwitchButton key={index} channel={channel} />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                        {hasMatchResults !== undefined && <Card className='bg-gray-700 border-none mt-2'>
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold">Kamp oversikt</CardTitle>
                            <CardDescription className=''> {match.teams[ 0 ].name} vs {match.teams[ 1 ].name}</CardDescription>
                          </CardHeader>
                          <CardContent className="grid gap-4">
                            <div>
                              <h3 className="text-sm font-medium mb-2">Banned Maps</h3>
                              <div className="flex flex-wrap gap-2">
                                {allBansmapped.map((e, index) => (
                                  <Badge key={index} variant='default' className="flex items-center gap-1 p-2 bg-gray-600">
                                    <Image
                                      width={24}
                                      height={24}
                                      className="w-6 h-6 rounded-full border-2 border-primary"
                                      alt={e.name || ''}
                                      src={e.image || ''}
                                    />
                                    <span className="text-xs">{e.name}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Separator />
                            <div className="grid gap-2">
                              <MatchResult title="Kamp 1" matchName={matchOneName || ''} homeScore={homeTeamScoreMatchOne} awayScore={awayTeamScoreMatchOne} />
                              <MatchResult title="Kamp 2" matchName={matchTwoName || ''} homeScore={homeTeamScoreMatchTwo} awayScore={awayTeamScoreMatchTwo} />
                              {hasTieBreaker && (
                                <MatchResult
                                  title="Tiebreaker"
                                  matchName={tieBreaker?.name || ''}
                                  homeScore={homeTeamScoreMatchThree}
                                  awayScore={awayTeamScoreMatchThree}
                                />
                              )}
                            </div>
                            <Separator className='mb-2' />
                            <CardTitle className="text-lg font-semibold">Warcraft logs</CardTitle>
                            <div className='flex gap-4 flex-col '>
                              {matchResults.find((e) => e.round === index + 1 && homeTeam === e.team_slug)?.warcraft_logs_report && (
                                <div>
                                  <h3 className="text-sm font-medium mb-2">{match.teams[ 0 ].name} logs</h3>
                                  <div className='bg-gray-600 p-4 rounded-lg'>
                                    <div className="flex  gap-2">
                                      {matchResults.find((e) => e.round === index + 1 && homeTeam === e.team_slug)?.warcraft_logs_report.map((link, index) => (
                                        <Button key={index} variant="secondary" className="bg-gray-800 hover:bg-gray-700 text-white">
                                          <a className='flex items-center gap-2' href={`https://warcraftlogs.com/reports/${link}`} target="_blank" rel="noreferrer">Log {index + 1} <ExternalLink /> </a>
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {matchResults.find((e) => e.round === index + 1 && homeTeam === e.team_slug)?.warcraft_logs_report && (
                                <div>
                                  <h3 className="text-sm font-medium mb-2">{match.teams[ 1 ].name} logs</h3>

                                  <div className='bg-gray-600  p-4 rounded-lg'>
                                    <div className="flex  gap-2">
                                      {matchResults.find((e) => e.round === index + 1 && awayTeam === e.team_slug)?.warcraft_logs_report.map((link, index) => (
                                        <Button key={index} variant="secondary" className="bg-gray-800 hover:bg-gray-700 text-white ">
                                          <a className='flex items-center gap-2' href={`https://warcraftlogs.com/reports/${link}`} target="_blank" rel="noreferrer">Log {index + 1} <ExternalLink /> </a>
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                          </CardContent>
                        </Card>}
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



function findMissingIds(dungeonConfig: dungeonConfigType[], selectedIds: number[]): number | undefined
{
  const configIds = dungeonConfig.map(dungeon => dungeon.id);
  const selectedIdsSet = new Set(selectedIds);

  const missingId = configIds.find(id => !selectedIdsSet.has(id));
  return missingId;
}


function MatchResult({ title, matchName, homeScore, awayScore }: { title: string, matchName: string, homeScore: number, awayScore: number })
{
  return (
    <div className="bg-gray-600 p-2 rounded-md">
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="flex justify-between items-center">
        <div className="text-sm flex gap-1 items-center"><Image alt={matchName} height={16} width={16} className='w-4 rounded-full h-4' src={dungeonConfig.find((e) => e.name === matchName)?.image || ''} /> {matchName}</div>
        <div className="text-sm font-semibold">
          {homeScore} - {awayScore}
        </div>
      </div>
    </div>
  )
}


function TwitchButton({ channel }: { channel: string })
{
  return (
    <Button
      variant="secondary"
      className="bg-purple-600 hover:bg-purple-700 text-white"
      asChild
    >
      <a
        href={`https://twitch.tv/${channel}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2"
      >
        <TwitchIcon className="w-4 h-4" />
        <span>{channel}</span>
      </a>
    </Button>
  )
}
