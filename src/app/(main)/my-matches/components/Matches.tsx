'use client'
import React, { useEffect } from 'react'
import { useGetUserData } from '@/app/auth/useGetUserData'
import supabase from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarX, Check, CheckCircle, Clock, Info, X, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Image from 'next/image'
import { urlForImage } from '../../../../../sanity/lib/image'
import PickBanV2 from './matches/PickBanV2'
import { InfoBoxComponent } from '@/components/info-box'
import { Match, MatchRecord, Team, TournamentSchedule } from '../../../../../types'
import
{
  create_match_results,
  createPickBanRow,
  PickAndBansType,
  TMatchResults,
} from '../../../../../supabase/dbFunctions'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { createSortedRounds } from '../page'

export function Matches({
  pickAndBansData,
  matchResults,
  sanityTeamData,
  schedule,
  teams,
  rounds,
}: {
  pickAndBansData: PickAndBansType[]
  matchResults: TMatchResults[]
  sanityTeamData: MythicPlusTeam[]
  schedule: TournamentSchedule
  teams: Team[]
  rounds: { round: number; round_date: string }[]
})
{
  const { user, loading } = useGetUserData()
  const email = user?.data.user?.email
  const myTeam = sanityTeamData.find((team) => team.contactPerson === email)
  const [ matchSchedule, setMatchSchedule ] = React.useState<TournamentSchedule>(schedule)
  const router = useRouter()
  const detailedSchedule = matchSchedule

  useEffect(() =>
  {

    if (!teams || loading || user?.data.user?.email === undefined) return

    const channel = supabase
      .channel('pick_ban')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
        },
        (payload) =>
        {
          const updatedData = payload.new as MatchRecord[]
          console.log(updatedData, '@@@@@@')
          if (updatedData) {
            supabase
              .from('matches')
              .select('*')
              .then((res) =>
              {
                console.log(res, '***RES****')
                setMatchSchedule(createSortedRounds(res.data as MatchRecord[], teams))
              })
          }
        },
      )
      .subscribe()

    return () =>
    {
      channel.unsubscribe()
    }
  }, [ teams, loading, user?.data.user?.email ])

  type matchDataType = Match & { myTeam: string } & { opponent: string }

  const [ matchData, setMatchData ] = React.useState<matchDataType | null>(null)

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
    <div>
      <h1 className="text-4xl text-center font-bold mt-10">Mine kamper</h1>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-10 w-full m-auto max-w-7xl p-4">
        <InfoBoxComponent
          title="Viktig info"
          description="Vennligst vær oppmerksom på at hvis du ikke sender inn kampresultatene dine innen 24 timer etter kampen, vil du automatisk tape på walkover."
        />

        {detailedSchedule.map((round, index) =>
        {
          return (
            <div key={index + round.toString()}>
              <div className="bg-gray-800 p-4 rounded-lg">
                <Accordion type="single" collapsible>
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

                        const homeTeamMatchResults = matchResults?.find((result) => result.team_slug === homeTeam)
                        const awayTeamMatchResults = matchResults?.find((result) => result.team_slug === awayTeam)

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
                          (e) =>
                            e.round === findMatch?.round &&
                            e.matchUUID === findMatch?.matchUUID &&
                            e.team_slug !== findMatch?.team_slug,
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

                        const matchDate = match.teams[ 0 ].roundDate
                        const matchStartTime = match.teams[ 0 ].round_startTime
                        const rescheduledDate = match.teams[ 0 ].rescheduled_round_date
                        const rescheduledStartTime = match.teams[ 0 ].rescheduled_round_startTime

                        //Convert to Oslo time and to a readable format
                        const matchDateTime = new Date(`${matchDate}T${matchStartTime}Z`)
                        const matchDateTimeString = matchDateTime.toLocaleString('nb-NO', {
                          timeZone: 'UTC',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })

                        const rescheduledDateTime = new Date(`${rescheduledDate}T${rescheduledStartTime}Z`)
                        const rescheduledDateTimeString = rescheduledDateTime.toLocaleString('nb-NO', {
                          timeZone: 'UTC',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                        const hasRescheduled = match.teams[ 0 ].rescheduled

                        const homeTeamRequestedReschedule =
                          match.teams[ 0 ].home_team_proposed_rescheduled_round_date &&
                            match.teams[ 0 ].home_team_proposed_rescheduled_round_startTime
                            ? true
                            : false

                        const awayTeamRequestedReschedule =
                          match.teams[ 1 ].away_team_proposed_rescheduled_round_date &&
                            match.teams[ 1 ].away_team_proposed_rescheduled_round_startTime
                            ? true
                            : false

                        const showNotificationAwayTeam =
                          homeTeamRequestedReschedule && match.teams[ 0 ].contactPerson !== email
                        const showNotificationHomeTeam =
                          awayTeamRequestedReschedule && match.teams[ 1 ].contactPerson !== email

                        const proposedRescheduledDateTime = new Date(
                          homeTeamRequestedReschedule
                            ? `${match.teams[ 0 ].home_team_proposed_rescheduled_round_date}T${match.teams[ 0 ].home_team_proposed_rescheduled_round_startTime}Z`
                            : `${match.teams[ 1 ].away_team_proposed_rescheduled_round_date}T${match.teams[ 1 ].away_team_proposed_rescheduled_round_startTime}Z`,
                        )
                        const proposedRescheduledDateTimeString = proposedRescheduledDateTime.toLocaleString('nb-NO', {
                          timeZone: 'UTC',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })

                        const showPickBanButtonOneWeekBeforeRound =
                          new Date(matchDate).getTime() - new Date().getTime() < 604800000

                        const showNotification = showNotificationAwayTeam || showNotificationHomeTeam

                        if (match.teams?.[ 0 ].contactPerson !== email && match.teams?.[ 1 ].contactPerson !== email) {
                          return null
                        }

                        return (
                          <div key={index}>
                            {showNotification && (
                              <div className="flex flex-col bg-[#011624] p-4 rounded-lg mb-2">
                                <div className="flex flex-col">
                                  <div className="flex gap-2">
                                    <Clock />
                                    <div className="">
                                      <b>{homeTeamRequestedReschedule ? match.teams[ 0 ].name : match.teams[ 1 ].name} </b>{' '}
                                      har foreslått ny tid for kampen.
                                    </div>
                                  </div>
                                  <div className="ml-8"> Ny tid: {proposedRescheduledDateTimeString}</div>
                                </div>
                                <div className="flex mt-4 gap-4">
                                  <Button
                                    onClick={async () =>
                                    {
                                      const payload = homeTeamRequestedReschedule
                                        ? {
                                          home_team_proposed_rescheduled_round_date: null,
                                          home_team_proposed_rescheduled_round_startTime: null,
                                          rescheduled_round_startTime:
                                            match.teams[ 0 ].home_team_proposed_rescheduled_round_startTime,
                                          rescheduled_round_date:
                                            match.teams[ 0 ].home_team_proposed_rescheduled_round_date,
                                          rescheduled: true,
                                          away_team_agree_reschedule: false,
                                          home_team_agree_reschedule: false,
                                        }
                                        : {
                                          away_team_proposed_rescheduled_round_date: null,
                                          away_team_proposed_rescheduled_round_startTime: null,
                                          rescheduled_round_startTime:
                                            match.teams[ 1 ].away_team_proposed_rescheduled_round_startTime,
                                          rescheduled_round_date:
                                            match.teams[ 1 ].away_team_proposed_rescheduled_round_date,
                                          rescheduled: true,
                                          home_team_agree_reschedule: false,
                                          away_team_agree_reschedule: false,
                                        }
                                      await supabase.from('matches').update(payload).eq('id', match.teams[ 0 ].id)
                                    }}
                                    className="bg-green-400 text-white"
                                  >
                                    {' '}
                                    <Check /> Godta ny kampttid
                                  </Button>{' '}
                                  <Button
                                    onClick={async () =>
                                    {
                                      const payload = homeTeamRequestedReschedule
                                        ? {
                                          home_team_proposed_rescheduled_round_date: null,
                                          home_team_proposed_rescheduled_round_startTime: null,
                                          home_team_agree_reschedule: false,
                                        }
                                        : {
                                          away_team_proposed_rescheduled_round_date: null,
                                          away_team_proposed_rescheduled_round_startTime: null,
                                          away_team_agree_reschedule: false,
                                        }
                                      await supabase.from('matches').update(payload).eq('id', match.teams[ 0 ].id)
                                    }}
                                    className="bg-red-600 text-white"
                                  >
                                    <X /> Avslå ny kamptid
                                  </Button>{' '}
                                </div>
                              </div>
                            )}

                            <AccordionItem value={matchIndex.toString()}>
                              <AccordionTrigger className="bg-gray-700 p-4 w-full !no-underline rounded-lg  transition  ease-in-out cursor-pointer font-bold match_result_main_div">
                                <div className="flex  w-full relative ">
                                  {match.featured ? (
                                    <div className="hidden md:flex absolute top-0 left-0">
                                      <Badge>Featured</Badge>
                                    </div>
                                  ) : null}
                                  {hasRescheduled && (
                                    <Badge className="hidden md:flex bg-white text-black absolute right-0 top-0 mr-10">
                                      Rescheduled
                                    </Badge>
                                  )}
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
                                        className="hidden md:flex mr-0 md:w-12 md:h-12 w-10 h-10 border-[#FDB202] border-2 rounded-full"
                                      />
                                    </div>
                                  </div>
                                  <div className=" w-3/6 md:w-[40%] ">
                                    <div className=" text-xs flex flex-col">
                                      <span
                                        className={`${hasRescheduled && rescheduledDateTimeString ? 'line-through' : ''}`}
                                      >
                                        {matchDateTimeString}
                                      </span>
                                      {hasRescheduled && <span>Ny tid: {rescheduledDateTimeString}</span>}
                                    </div>
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
                                        className="hidden md:flex  md:w-12 md:h-12  w-10 h-10  border-[#ff5a00] border-2 rounded-full"
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

                            <div className="flex gap-2 mt-4 flex-wrap">
                              {!pickBanCompleted && showPickBanButtonOneWeekBeforeRound ? (
                                <Button
                                  className="bg-[#011624] text-white"
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
                                    setMatchData({
                                      ...match,
                                      myTeam: findMatch?.team_slug as string,
                                      opponent: opponent as string,
                                    })
                                  }}
                                >
                                  <CheckCircle />
                                  Gå til Pick/Ban
                                </Button>
                              ) : null}
                              {!confirmedResult && (
                                <Link href={`/my-matches/reschedule?id=${match.teams[ 0 ].id}`}>
                                  <Button className="bg-[#011624] text-white">
                                    <Clock /> Foreslå ny kamptid
                                  </Button>{' '}
                                </Link>
                              )}
                              {pickBanCompleted && !matchResultsAreConfirmed ? (
                                <Button
                                  className="bg-[#011624] text-white"
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
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Accordion>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
