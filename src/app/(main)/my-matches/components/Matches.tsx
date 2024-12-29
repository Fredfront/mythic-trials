'use client'
import React, { useEffect } from 'react'
import { useGetUserData } from '@/app/auth/useGetUserData'
import supabase from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarX, Check, CheckCircle, Clock, Hourglass, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Image from 'next/image'
import { urlForImage } from '../../../../../sanity/lib/image'
import PickBanV2 from './matches/PickBanV2'
import { InfoBoxComponent } from '@/components/info-box'
import { MatchRecord, SupabaseTeamType, TournamentSchedule } from '../../../../../types'
import {
  create_match_results,
  createPickBanRow,
  PickAndBansType,
  TMatchResults,
} from '../../../../supabase/dbFunctions'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { createSortedRounds } from '../page'
import { toast } from '@/hooks/use-toast'
import { useMatchData, useMatchDataOperations } from '@/context/MatchContext'
import Loading from '../../signup/components/Loading'

export function Matches({
  pickAndBansData,
  matchResultsData,
  sanityTeamData,
  schedule,
  teams,
}: {
  pickAndBansData: PickAndBansType[]
  matchResultsData: TMatchResults[]
  sanityTeamData: MythicPlusTeam[]
  schedule: TournamentSchedule
  teams: SupabaseTeamType[]
}) {
  const { user, loading } = useGetUserData()
  const email = user?.data.user?.email
  const myTeam = sanityTeamData.find((team) => team.contactPerson === email)
  const [matchSchedule, setMatchSchedule] = React.useState<TournamentSchedule>(schedule)
  const router = useRouter()
  const detailedSchedule = matchSchedule
  const [matchResults, setMatchResults] = React.useState<TMatchResults[]>(matchResultsData)

  useEffect(() => {
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
        (payload) => {
          const updatedData = payload.new as MatchRecord[]
          if (updatedData) {
            supabase
              .from('matches')
              .select('*')
              .then((res) => {
                setMatchSchedule(createSortedRounds(res.data as MatchRecord[], teams))
              })
          }
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [teams, loading, user?.data.user?.email])

  const { matchData } = useMatchData()
  const { setMatchData } = useMatchDataOperations()

  const hasMatchResultsData =
    matchResultsData?.find((e) => e.match_uuid === matchData?.teams?.[0].matchUUID)?.confirm === true

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    )

  if (!myTeam) {
    return (
      <div className="mt-[100px] p-4">
        <InfoBoxComponent
          title="Viktig info"
          description="Du har ikke registrert et lag. Registrer et lag for å se dine kamper."
        />
      </div>
    )
  }

  if (!hasMatchResultsData && matchData && matchData.teams.length === 2 && email) {
    return (
      <>
        <div
          className="flex gap-1 cursor-pointer hover:font-bold p-2"
          onClick={() => {
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
          description="Vennligst vær oppmerksom på at hvis du ikke sender inn kampresultatene dine innen 24 timer etter kampen, vil motstander kunne erklære seier."
        />

        {detailedSchedule.map((round, index) => {
          const isPlayoffMatch = round.find((match) => match.stage === 'playoff') ? true : false
          const isSemifinal = round.find((match) => match.playoff_round === 'semifinal') ? true : false
          const isFinal = round.find((match) => match.playoff_round === 'final') ? true : false
          const isQuarterFinal = round.find((match) => match.playoff_round === 'quarterfinal') ? true : false

          const typeOfFinalString = isFinal
            ? 'Finale'
            : isSemifinal
              ? 'Semifinaler'
              : isQuarterFinal
                ? 'Kvartfinaler'
                : ''

          return (
            <div key={index + round.toString()}>
              <div className="bg-gray-800 p-4 rounded-lg">
                <Accordion type="single" collapsible>
                  <h2 className="feed-header">{isPlayoffMatch ? typeOfFinalString : `Runde ${index + 1}`}</h2>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      {round.map((match, matchIndex) => {
                        const matchUUID = `${match.teams?.[0].team_slug}-${match.teams?.[1].team_slug}-round-${match.teams?.[0].round}`
                        const homeTeam = match.teams?.[0].team_slug
                        const awayTeam = match.teams?.[1].team_slug
                        const homeTeamName = match.teams?.[0].name
                        const awayTeamName = match.teams?.[1].name
                        const homeTeamImageUrl = sanityTeamData.find((e) => e.teamName === homeTeamName)?.teamImage
                          .asset._ref
                        const awayTeamImageUrl = sanityTeamData.find((e) => e.teamName === awayTeamName)?.teamImage
                          .asset._ref

                        const homeTeamMatchResults = matchResults?.find((result) => result.team_slug === homeTeam)
                        const awayTeamMatchResults = matchResults?.find((result) => result.team_slug === awayTeam)

                        const homeTeamWins = homeTeamMatchResults?.winner
                        const isDraw = homeTeamMatchResults?.draw || awayTeamMatchResults?.draw

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
                              payloadCreateNewPickBanRow.team_slug === myTeam?.teamSlug &&
                              e.contact_person === email,
                          )?.completed === true

                        const myMatchResultsAreConfirmed =
                          matchResults?.find(
                            (e) => e.team_slug === myTeam?.teamSlug && e.round === payloadCreateNewPickBanRow.round,
                          )?.confirm === true

                        const myMatchResultsAreClaimed =
                          matchResults?.find(
                            (e) =>
                              e.team_slug === payloadCreateNewPickBanRow.team_slug &&
                              e.round === payloadCreateNewPickBanRow.round,
                          )?.claimed_win === true

                        const opponentMatchResultsAreConfirmed =
                          matchResults?.find(
                            (e) =>
                              e.round === match.teams[0].round &&
                              e.team_slug !== myTeam?.teamSlug &&
                              e.opponent === myTeam?.teamSlug,
                          )?.confirm === true

                        const opponentIsReadyToStartPickAndBan =
                          pickAndBansData?.find(
                            (e) =>
                              e.round === match.teams[0].round && e.team_slug !== myTeam?.teamSlug && e.ready === true,
                          )?.ready === true

                        const myTeamIsReadyToStartPickAndBan =
                          pickAndBansData?.find(
                            (e) =>
                              e.round === match.teams[0].round && e.team_slug === myTeam?.teamSlug && e.ready === true,
                          )?.ready === true

                        const matchResultsAreConfirmed = myMatchResultsAreConfirmed && opponentMatchResultsAreConfirmed
                        const matchDate = match.teams[0].roundDate
                        const matchStartTime = match.teams[0].round_startTime
                        const rescheduledDate = match.teams[0].rescheduled_round_date
                        const rescheduledStartTime = match.teams[0].rescheduled_round_startTime

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
                        const hasRescheduled = match.teams[0].rescheduled

                        const homeTeamRequestedReschedule =
                          match.teams[0].home_team_proposed_rescheduled_round_date &&
                          match.teams[0].home_team_proposed_rescheduled_round_startTime
                            ? true
                            : false

                        const awayTeamRequestedReschedule =
                          match.teams[1].away_team_proposed_rescheduled_round_date &&
                          match.teams[1].away_team_proposed_rescheduled_round_startTime
                            ? true
                            : false

                        const showNotificationAwayTeam =
                          homeTeamRequestedReschedule && match.teams[0].contactPerson !== email
                        const showNotificationHomeTeam =
                          awayTeamRequestedReschedule && match.teams[1].contactPerson !== email

                        const proposedRescheduledDateTime = new Date(
                          homeTeamRequestedReschedule
                            ? `${match.teams[0].home_team_proposed_rescheduled_round_date}T${match.teams[0].home_team_proposed_rescheduled_round_startTime}Z`
                            : `${match.teams[1].away_team_proposed_rescheduled_round_date}T${match.teams[1].away_team_proposed_rescheduled_round_startTime}Z`,
                        )
                        const proposedRescheduledDateTimeString = proposedRescheduledDateTime.toLocaleString('nb-NO', {
                          timeZone: 'UTC',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })

                        const matchPlayTime = parseDateString(
                          hasRescheduled ? rescheduledDateTimeString : matchDateTimeString,
                        )

                        // Calculate 24 hours after match time
                        const matchPlayTimePlusTwentyFourHours = matchPlayTime.getTime() + 86400000
                        const twentyFourHoursAfterGame = new Date().getTime() > matchPlayTimePlusTwentyFourHours

                        const showPickBanButtonOneWeekBeforeRound =
                          new Date(matchPlayTime).getTime() - new Date().getTime() < 604800000

                        const showNotification = showNotificationAwayTeam || showNotificationHomeTeam

                        if (match.teams?.[0].contactPerson !== email && match.teams?.[1].contactPerson !== email) {
                          return null
                        }

                        return (
                          <div key={index + matchIndex + match.teams[0].matchUUID}>
                            {showNotification && (
                              <div className="flex flex-col bg-[#011624] p-4 rounded-lg mb-2">
                                <div className="flex flex-col">
                                  <div className="flex gap-2">
                                    <Clock />
                                    <div className="">
                                      <b>{homeTeamRequestedReschedule ? match.teams[0].name : match.teams[1].name} </b>{' '}
                                      har foreslått ny tid for kampen.
                                    </div>
                                  </div>
                                  <div className="ml-8"> Ny tid: {proposedRescheduledDateTimeString}</div>
                                </div>
                                <div className="flex mt-4 gap-4">
                                  <Button
                                    onClick={async () => {
                                      const payload = homeTeamRequestedReschedule
                                        ? {
                                            home_team_proposed_rescheduled_round_date: null,
                                            home_team_proposed_rescheduled_round_startTime: null,
                                            rescheduled_round_startTime:
                                              match.teams[0].home_team_proposed_rescheduled_round_startTime,
                                            rescheduled_round_date:
                                              match.teams[0].home_team_proposed_rescheduled_round_date,
                                            rescheduled: true,
                                            away_team_agree_reschedule: false,
                                            home_team_agree_reschedule: false,
                                          }
                                        : {
                                            away_team_proposed_rescheduled_round_date: null,
                                            away_team_proposed_rescheduled_round_startTime: null,
                                            rescheduled_round_startTime:
                                              match.teams[1].away_team_proposed_rescheduled_round_startTime,
                                            rescheduled_round_date:
                                              match.teams[1].away_team_proposed_rescheduled_round_date,
                                            rescheduled: true,
                                            home_team_agree_reschedule: false,
                                            away_team_agree_reschedule: false,
                                          }
                                      await supabase.from('matches').update(payload).eq('id', match.teams[0].id)

                                      //send discord message
                                      const channelName = `${homeTeam}-vs-${awayTeam}`
                                      const roleName = myTeam?.teamName
                                      const message = `📢 **${myTeam?.teamName}** has ACCEPTED the request to reschedule! @here

Ny tid: ${proposedRescheduledDateTimeString} `

                                      // Send message to Discord channel with role mention
                                      const response = await fetch('/api/discord/send-message', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ channelName, message, roleName }),
                                      })

                                      if (response.ok) {
                                        toast({
                                          title: 'Success',
                                          description: 'Message sent to Discord',
                                        })
                                      } else {
                                        toast({
                                          title: 'Error',
                                          description: 'Failed to send message to Discord',
                                        })
                                      }
                                    }}
                                    className="bg-green-400 text-white"
                                  >
                                    {' '}
                                    <Check /> Godta ny kampttid
                                  </Button>{' '}
                                  <Button
                                    onClick={async () => {
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
                                      await supabase.from('matches').update(payload).eq('id', match.teams[0].id)

                                      //send discord message
                                      const channelName = `${homeTeam}-vs-${awayTeam}`
                                      const roleName = myTeam?.teamName
                                      const message = `📢 **${myTeam?.teamName}** has DECLINED the request to reschedule! @here`
                                      // Send message to Discord channel with role mention
                                      const response = await fetch('/api/discord/send-message', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ channelName, message, roleName }),
                                      })

                                      if (response.ok) {
                                        toast({
                                          title: 'Success',
                                          description: 'Message sent to Discord',
                                        })
                                      } else {
                                        toast({
                                          title: 'Error',
                                          description: 'Failed to send message to Discord',
                                        })
                                      }
                                    }}
                                    className="bg-red-600 text-white"
                                  >
                                    <X /> Avslå ny kamptid
                                  </Button>{' '}
                                </div>
                              </div>
                            )}

                            <AccordionItem value={matchIndex.toString()}>
                              <AccordionTrigger className="bg-gray-700 p-4 w-full min-h-[120px] !no-underline rounded-lg  transition  ease-in-out cursor-pointer font-bold match_result_main_div">
                                <div className="flex w-full relative ">
                                  {match.featured ? (
                                    <div className="hidden md:flex absolute top-0 left-0  -mt-6 ">
                                      <Badge>Featured</Badge>
                                    </div>
                                  ) : null}
                                  {hasRescheduled && (
                                    <Badge className="hidden md:flex bg-white text-black absolute right-0 top-0 -mt-4 -mr-4">
                                      Rescheduled
                                    </Badge>
                                  )}
                                  <div className="flex w-2/5 md:w-[40%] text-right justify-end">
                                    <div className="flex-col text-ellipsis overflow-hidden text-nowrap truncate ">
                                      {confirmedResult ? (
                                        <div
                                          className={`text-sm ${isDraw ? 'text-orange-400' : homeTeamWins ? 'text-[#40b3a1]' : ' text-red-600'}`}
                                        >
                                          {isDraw ? 'Uavgjort' : homeTeamWins ? 'Vinner' : 'Taper'}
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
                                          className={`text-sm ${isDraw ? 'text-orange-400' : !homeTeamWins ? 'text-[#40b3a1]' : ' text-red-600'}`}
                                        >
                                          {isDraw ? 'Uavgjort' : !homeTeamWins ? 'Vinner' : 'Taper'}
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
                                <>
                                  {opponentIsReadyToStartPickAndBan && !myTeamIsReadyToStartPickAndBan && (
                                    <div className="w-full flex gap-2 pb-4 pt-4">
                                      <Hourglass className="animate-ping		" width={20} height={20} />
                                      Motstander er klar til å starte pick/ban
                                    </div>
                                  )}
                                  <Button
                                    className="bg-[#011624] text-white"
                                    onClick={async () => {
                                      if (email) {
                                        await supabase
                                          .from('pick_ban')
                                          .select('*')
                                          .eq('contact_person', email)
                                          .eq('round', match.teams?.[0].round)
                                          .then((res) => {
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
                                </>
                              ) : null}
                              {myMatchResultsAreConfirmed ||
                              opponentMatchResultsAreConfirmed ||
                              matchPlayTime.getTime() < new Date().getTime() ? null : (
                                <Link href={`/my-matches/reschedule?id=${match.teams[0].id}`}>
                                  <Button className="bg-[#011624] text-white">
                                    <Clock /> Foreslå ny kamptid
                                  </Button>{' '}
                                </Link>
                              )}
                              {!twentyFourHoursAfterGame && pickBanCompleted && !matchResultsAreConfirmed ? (
                                <Button
                                  className="bg-[#011624] text-white"
                                  onClick={async () => {
                                    setMatchData({
                                      ...match,
                                      myTeam: findMatch?.team_slug as string,
                                      opponent: opponent as string,
                                    })

                                    await supabase
                                      .from('match_results')
                                      .select('*')
                                      .eq('contact_person', email)
                                      .eq('round', match.teams[0].round)
                                      .then((res) => {
                                        if (res.data && res.data.length === 0) {
                                          create_match_results({
                                            matchResults: {
                                              contact_person: email as string,
                                              opponent: myTeam?.teamSlug === homeTeam ? awayTeam : homeTeam,
                                              round: match.teams[0].round,
                                              team_slug: myTeam?.teamSlug as string,
                                              match_uuid: matchUUID,
                                            },
                                          })
                                        }
                                      })
                                      .then(() => {
                                        router.push(
                                          '/my-matches/results?home=' +
                                            match.teams[0].team_slug +
                                            '&away=' +
                                            match.teams[1].team_slug +
                                            '&round=' +
                                            match.teams[0].round,
                                        )
                                      })
                                  }}
                                >
                                  {myMatchResultsAreConfirmed ? 'Endre mine resultat' : 'Legg til resultat'}
                                </Button>
                              ) : null}
                              {!myMatchResultsAreClaimed &&
                                twentyFourHoursAfterGame &&
                                myMatchResultsAreConfirmed &&
                                opponentMatchResultsAreConfirmed !== true && (
                                  <Button
                                    onClick={async () => {
                                      handleClaimWin({
                                        contact_person: email,
                                        round: match.teams[0].round,
                                        match_uuid: matchUUID,
                                        opponent: myTeam?.teamSlug === homeTeam ? awayTeam : homeTeam,
                                        team_slug: myTeam?.teamSlug as string,
                                      }).then((res) => {
                                        if (res) {
                                          //send discord message
                                          const channelName = `${homeTeam}-vs-${awayTeam}`
                                          const roleName = myTeam?.teamName
                                          const message = `💀 **${myTeam?.teamName}** 💀 has CLAIMED VICTORY over **${opponent}** @here`

                                          // Send message to Discord channel with role mention
                                          const response = fetch('/api/discord/send-message', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ channelName, message, roleName }),
                                          })

                                          setMatchResults(res)
                                        }
                                      })
                                    }}
                                  >
                                    Claim win
                                  </Button>
                                )}
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

function parseDateString(dateStr: string): Date {
  const months: { [key: string]: number } = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    mai: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    okt: 9,
    nov: 10,
    des: 11,
  }

  const [day, monthStr, year, time] = dateStr.split(/[.,\s]+/)
  const [hour, minute] = time.split(':')

  const month = months[monthStr.toLowerCase()]
  if (month === undefined) {
    throw new Error(`Invalid month string: ${monthStr}`)
  }

  // Parse strings to numbers
  const dayNum = parseInt(day, 10)
  const yearNum = parseInt(year, 10)
  const hourNum = parseInt(hour, 10)
  const minuteNum = parseInt(minute, 10)

  return new Date(yearNum, month, dayNum, hourNum, minuteNum)
}

const handleClaimWin = async ({
  contact_person,
  round,
  match_uuid,
  opponent,
  team_slug,
}: {
  contact_person: string
  round: number
  match_uuid: string
  opponent: string
  team_slug: string
}) => {
  try {
    const response = await fetch('/api/supabase/claim-win', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_person, round, match_uuid, opponent: opponent, team_slug }),
    })

    const result = await response.json()

    if (result.error) {
      console.error('Error claiming win:', result.error)
      return null
    }

    return result.data
  } catch (error) {
    console.error('Error:', error)
  }
}
