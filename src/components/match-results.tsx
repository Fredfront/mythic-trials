'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, XCircle, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Separator } from '@/components/ui/separator'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGetUserData } from '@/app/auth/useGetUserData'
import supabase from '@/utils/supabase/client'
import { dungeonConfig } from '@/app/(main)/turnering/utils/dungeonConfig'
import { PickAndBansType, TTeam, TMatchResults, create_match_results } from '../../supabase/dbFunctions'

type MatchResult = 'win' | 'loss' | null

interface TeamResults {
  match1: MatchResult
  match2: MatchResult
  match3: MatchResult
}

export function MatchResultsComponent({
  pickAndBanData,
  teams,
  matchResults,
}: {
  pickAndBanData: PickAndBansType[]
  teams: TTeam[]
  matchResults: TMatchResults[]
}) {
  const round = parseInt(useSearchParams().get('round') || '0')

  const { user, loading } = useGetUserData()
  const email = user?.data.user?.email
  const contact_person = user?.data.user?.email || ''

  const [myMatchResults, setMyMatchResults] = useState<TMatchResults | null>(
    matchResults.find((e) => e.contact_person === contact_person && e.round === round) || null,
  )
  const [opponentMatchResults, setOpponentMatchResults] = useState<TMatchResults | null>(
    matchResults.find(
      (e) => e.contact_person !== contact_person && e.round === round && e.team_slug === myMatchResults?.opponent,
    ) || null,
  )

  const [team1Results, setTeam1Results] = useState<TeamResults>({
    match1: myMatchResults?.match_1 === 1 ? 'win' : myMatchResults?.match_1 === 0 ? 'loss' : null,
    match2: myMatchResults?.match_2 === 1 ? 'win' : myMatchResults?.match_2 === 0 ? 'loss' : null,
    match3: myMatchResults?.match_3 === 1 ? 'win' : myMatchResults?.match_3 === 0 ? 'loss' : null,
  })

  const [team2Results, setTeam2Results] = useState<TeamResults>({
    match1: opponentMatchResults?.match_1 === 1 ? 'win' : opponentMatchResults?.match_1 === 0 ? 'loss' : null,
    match2: opponentMatchResults?.match_2 === 1 ? 'win' : opponentMatchResults?.match_2 === 0 ? 'loss' : null,
    match3: opponentMatchResults?.match_3 === 1 ? 'win' : opponentMatchResults?.match_3 === 0 ? 'loss' : null,
  })
  const [myTeamSubmitted, setMyTeamSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (team1Results.match1 === null && myMatchResults?.match_1 !== null) {
      setTeam1Results((prev) => ({
        ...prev,
        match1: myMatchResults?.match_1 === 1 ? 'win' : myMatchResults?.match_1 === 0 ? 'loss' : null,
      }))
    }

    if (team1Results.match2 === null && myMatchResults?.match_2 !== null) {
      setTeam1Results((prev) => ({
        ...prev,
        match2: myMatchResults?.match_2 === 1 ? 'win' : myMatchResults?.match_2 === 0 ? 'loss' : null,
      }))
    }

    if (team1Results.match3 === null && myMatchResults?.match_3 !== null) {
      setTeam1Results((prev) => ({
        ...prev,
        match3: myMatchResults?.match_3 === 1 ? 'win' : myMatchResults?.match_3 === 0 ? 'loss' : null,
      }))
    }

    if (team2Results.match1 === null && opponentMatchResults?.match_1 !== null) {
      setTeam2Results((prev) => ({
        ...prev,
        match1: opponentMatchResults?.match_1 === 1 ? 'win' : opponentMatchResults?.match_1 === 0 ? 'loss' : null,
      }))
    }

    if (team2Results.match2 === null && opponentMatchResults?.match_2 !== null) {
      setTeam2Results((prev) => ({
        ...prev,
        match2: opponentMatchResults?.match_2 === 1 ? 'win' : opponentMatchResults?.match_2 === 0 ? 'loss' : null,
      }))
    }

    if (team2Results.match3 === null && opponentMatchResults?.match_3 !== null) {
      setTeam2Results((prev) => ({
        ...prev,
        match3: opponentMatchResults?.match_3 === 1 ? 'win' : opponentMatchResults?.match_3 === 0 ? 'loss' : null,
      }))
    }
  }, [
    myMatchResults,
    team1Results.match1,
    team1Results.match2,
    team1Results.match3,
    team2Results.match1,
    team2Results.match2,
    team2Results.match3,
    opponentMatchResults?.match_1,
    opponentMatchResults?.match_2,
    opponentMatchResults?.match_3,
  ])

  const router = useRouter()
  const home_team = useSearchParams().get('home')
  const away_team = useSearchParams().get('away')

  const myTeam = teams.find((e) => e.contact_person === user?.data.user?.email)
  const homeAndAwayTeam = [home_team, away_team]
  const opponentTeam = homeAndAwayTeam.find((e) => e !== myTeam?.team_slug)
  const opponent_contact_person = teams.find((e) => e.team_slug === opponentTeam)?.contact_person
  const homeTeamToSlug = home_team?.toLowerCase().replace(/\s/g, '-')
  const awayTeamToSlug = away_team?.toLowerCase().replace(/\s/g, '-')
  const myPickAndBansTable = pickAndBanData.find((e) => e.contact_person === email && e.round === round)
  const opponentPickAndBansTable = pickAndBanData.find((e) => e.team_slug === opponentTeam && e.round === round)
  const bothTeamsConfirmed =
    myMatchResults?.confirm &&
    opponentMatchResults?.confirm &&
    myMatchResults?.winner !== null &&
    opponentMatchResults?.winner !== null
      ? true
      : false

  const myBans = myPickAndBansTable?.bans || []
  const myPickedDungeon = myPickAndBansTable?.pick || ''
  const opponentBans = opponentPickAndBansTable?.bans || []
  const opponentPickedDungeon = opponentPickAndBansTable?.pick || ''

  const firstMatch = myPickAndBansTable?.home ? opponentPickedDungeon : myPickedDungeon
  const secondMatch = myPickAndBansTable?.home ? myPickedDungeon : opponentPickedDungeon
  const allBans = [...myBans, ...opponentBans]
  const allPickedDungeons = [firstMatch, secondMatch]

  const getTiebreaker = () => {
    return dungeonConfig.find((dungeon) => !allPickedDungeons.includes(dungeon.id) && !allBans.includes(dungeon.id))
  }

  const dungeonsNames = {
    match1: dungeonConfig.find((dungeon) => dungeon.id === firstMatch)?.name,
    match2: dungeonConfig.find((dungeon) => dungeon.id === secondMatch)?.name,
    tiebreaker: getTiebreaker()?.name,
  }

  useEffect(() => {
    if (!contact_person || !round) return
    getMatchresults(contact_person, round).then((res) => {
      const response = res as TMatchResults[]
      setMyMatchResults(response.find((e) => e.contact_person === contact_person && e.round === round) || null)
    })
  }, [round, contact_person])

  useEffect(() => {
    if (!opponent_contact_person || !round) return
    getMatchresults(opponent_contact_person, round).then((res) => {
      const response = res as TMatchResults[]
      setOpponentMatchResults(
        response.find((e) => e.contact_person === opponent_contact_person && e.round === round) || null,
      )
    })
  }, [round, opponent_contact_person])

  useEffect(() => {
    //If myPickAndBansTable?.team_slug is not equal either homeTeam or awayTeam navigatge awayt
    if (
      !loading &&
      myPickAndBansTable?.team_slug.toLowerCase() !== homeTeamToSlug &&
      myPickAndBansTable?.team_slug.toLowerCase() !== awayTeamToSlug
    ) {
      return router.push('/my-matches')
    }
  }, [awayTeamToSlug, homeTeamToSlug, loading, myPickAndBansTable?.team_slug, router])

  useEffect(() => {
    if (!awayTeamToSlug || !homeTeamToSlug || !contact_person || !round) return
    createMatchResultsIfNotExists({
      awayTeam: awayTeamToSlug,
      email: contact_person,
      homeTeam: homeTeamToSlug,
      myTeamSlug: myTeam?.team_slug as string,
      round: round,
    })
  }, [awayTeamToSlug, contact_person, homeTeamToSlug, myTeam?.team_slug, round])

  useEffect(() => {
    const channel = supabase
      .channel('pick_ban')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'match_results',
        },
        (payload) => {
          const newPayload = payload.new as TMatchResults
          if (newPayload.contact_person === contact_person && newPayload.round === round) {
            setMyMatchResults(newPayload)
          }

          if (newPayload.contact_person === opponent_contact_person && newPayload.round === round) {
            setOpponentMatchResults(newPayload)
            setTeam2Results({
              match1: newPayload.match_1 === 1 ? 'win' : newPayload.match_1 === 0 ? 'loss' : null,
              match2: newPayload.match_2 === 1 ? 'win' : newPayload.match_2 === 0 ? 'loss' : null,
              match3: newPayload.match_3 === 1 ? 'win' : newPayload.match_3 === 0 ? 'loss' : null,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contact_person, opponent_contact_person, round])

  const updateResult = (team: string, match: 'match1' | 'match2' | 'match3', result: MatchResult) => {
    const setResults = team === myTeam?.team_slug ? setTeam1Results : setTeam2Results

    if (!needsTiebreaker(team1Results, team2Results) && team1Results.match3 !== null) {
      updateMatchResults(contact_person, round, null, 3)
      setResults((prev) => ({ ...prev, match3: null }))
      setTeam1Results((prev) => ({ ...prev, match3: null }))
      setTeam2Results((prev) => ({ ...prev, match3: null }))
    }

    updateMatchResults(
      contact_person,
      round,
      result === 'win' ? 1 : result === 'loss' ? 0 : null,
      match === 'match1' ? 1 : match === 'match2' ? 2 : 3,
    )

    setResults((prev) => {
      const newResults = { ...prev, [match]: result }
      validateResults(team, newResults)
      return newResults
    })
  }

  const validateResults = (team: string, results: TeamResults) => {
    const opponentResults = team === myTeam?.team_slug ? team2Results : team1Results
    for (const match of ['match1', 'match2', 'match3'] as const) {
      if (results[match] && opponentResults[match] && results[match] === opponentResults[match]) {
        setErrorMessage(`Conflicting results for ${match}. Please check your inputs.`)
        return false
      }
    }
    setErrorMessage(null)
    return true
  }

  const needsTiebreaker = (team1: TeamResults, team2: TeamResults) => {
    const team1Wins = Object.values(team1).filter((result) => result === 'win').length
    const team1Losses = Object.values(team1).filter((result) => result === 'loss').length
    const team2Wins = Object.values(team2).filter((result) => result === 'win').length
    const team2Losses = Object.values(team2).filter((result) => result === 'loss').length
    return (
      (team1Wins === 1 && team2Wins === 1) ||
      (team1Wins === 2 && team2Wins === 2) ||
      (team1Wins === 1 && team1Losses === 1) ||
      (team2Wins === 1 && team2Losses === 1)
    )
  }

  const wonBoth = myMatchResults?.match_1 === 1 && myMatchResults?.match_2 === 1
  const lostBoth = myMatchResults?.match_1 === 0 && myMatchResults?.match_2 === 0

  const hideTieBreaker = wonBoth || lostBoth || myMatchResults?.match_1 === null || myMatchResults?.match_2 === null

  const renderMatchResult = (team: string, match: 'match1' | 'match2' | 'match3') => {
    const results = team === myTeam?.team_slug ? team1Results : team2Results
    const submitted = team === myTeam?.team_slug ? myTeamSubmitted : opponentMatchResults?.confirm

    return (
      <div className="flex space-x-2">
        <Button
          variant={results[match] === 'win' ? 'default' : 'outline'}
          onClick={() => updateResult(team, match, 'win')}
          disabled={submitted || team === opponentTeam}
          className={`w-full py-6 ${results[match] === 'win' ? 'bg-green-600 hover:bg-green-700' : 'bg-transparent text-white border-white hover:bg-white/10'}`}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Win
        </Button>
        <Button
          variant={results[match] === 'loss' ? 'default' : 'outline'}
          onClick={() => updateResult(team, match, 'loss')}
          disabled={submitted || team === opponentTeam}
          className={`w-full py-6 ${results[match] === 'loss' ? 'bg-red-600 hover:bg-red-700' : 'bg-transparent text-white border-white hover:bg-white/10'}`}
        >
          <XCircle className="mr-2 h-5 w-5" />
          Loss
        </Button>
      </div>
    )
  }

  const renderTeamCard = (team: string) => {
    const results = team === myTeam?.team_slug ? team1Results : team2Results
    const submitted = team === myTeam?.team_slug ? myTeamSubmitted : opponentMatchResults?.confirm
    const opponentSubmitted = team === myTeam?.team_slug ? opponentMatchResults?.confirm : myTeamSubmitted

    const handleSubmit = () => {
      const match1Point = results.match1 === 'win' ? 1 : 0
      const match2Point = results.match2 === 'win' ? 1 : 0
      const match3Point = results.match3 === 'win' ? 1 : 0

      const points = match1Point + match2Point + match3Point

      if (team === myTeam?.team_slug && myMatchResults?.confirm !== true) {
        setMyTeamSubmitted(true)
        confirmResults(contact_person, round, points >= 2, true)
      }

      if (myMatchResults?.confirm === true) {
        if (team === myTeam?.team_slug) {
          setMyTeamSubmitted(false)
          confirmResults(contact_person, round, points >= 2, false)
        }
      }
    }

    if (bothTeamsConfirmed) return null

    return (
      <Card
        className={`w-full ${team === myTeam?.team_slug ? 'border-blue-500' : 'border-red-500'} border-t-4 bg-gray-800 text-white`}
      >
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{team === myTeam?.team_slug ? myTeam?.name : team}</CardTitle>
          {!bothTeamsConfirmed && (
            <CardDescription className="text-gray-300">
              {team === myTeam?.team_slug ? 'Enter your match results' : 'Opponents match result'}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Match 1: {dungeonsNames.match1} </h3>
              {renderMatchResult(team, 'match1')}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Match 2: {dungeonsNames.match2}</h3>
              {renderMatchResult(team, 'match2')}
            </div>
            <>
              {hideTieBreaker ? null : (
                <div>
                  <h3 className="text-sm font-medium mb-2">Tiebreaker: {dungeonsNames.tiebreaker}</h3>
                  {renderMatchResult(team, 'match3')}
                </div>
              )}
            </>
          </div>
          {team === opponentTeam || bothTeamsConfirmed || myMatchResults?.confirm === true ? null : (
            <Button
              onClick={handleSubmit}
              disabled={
                submitted ||
                errorMessage !== null ||
                (Object.values(results).filter((result) => result !== null).length < 2 &&
                  !needsTiebreaker(team1Results, team2Results)) ||
                (needsTiebreaker(team1Results, team2Results) && results.match3 === null)
              }
              className="w-full py-6 text-lg bg-[#fdb202] hover:bg-[#fdb202]/90 text-gray-900"
            >
              Bekreft resultat
            </Button>
          )}
          {myMatchResults?.confirm === true && team === myMatchResults.team_slug && (
            <Button
              onClick={handleSubmit}
              className="w-full py-6 text-lg bg-[#fd0202] hover:bg-[#fd0202]/90 text-white"
            >
              Cancel results
            </Button>
          )}
          <>
            {submitted && !bothTeamsConfirmed && (
              <div>
                <strong className="font-bold">Bekrefet!</strong>
                <span className="block sm:inline"> Resultater er lagt til.</span>
              </div>
            )}
            {submitted && !bothTeamsConfirmed && myTeam?.team_slug === team && (
              <div>
                <strong className="font-bold">Info!</strong>
                <span className="block sm:inline">
                  {' '}
                  Du kan kansellere resultatene dine ved å trykke på Cancel results knappen.
                </span>
              </div>
            )}
            {team === myTeam?.team_slug && opponentSubmitted && !bothTeamsConfirmed && (
              <div>
                <strong className="font-bold">Heads up!</strong>
                <span className="block sm:inline"> Din motstander har lagt inn resultat</span>
              </div>
            )}
          </>
        </CardContent>
      </Card>
    )
  }

  const renderMatchOverview = () => {
    const getMatchResult = (match: 'match1' | 'match2' | 'match3') => {
      if (team1Results[match] === 'win' && team2Results[match] === 'loss') return `${myTeam?.team_slug} wins`
      if (team2Results[match] === 'win' && team1Results[match] === 'loss') return `${opponentTeam} wins`
      if (team1Results[match] && team2Results[match] && team1Results[match] !== team2Results[match]) return 'Conflict'
      if (team1Results[match] === null && team2Results[match] === null) return ''
      return ''
    }

    const calculatePoints = (results: TeamResults) => {
      return Object.values(results).filter((result) => result === 'win').length
    }

    const team1Points = calculatePoints(team1Results)
    const team2Points = calculatePoints(team2Results)

    return (
      <Card className="w-full bg-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Match Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">1: {dungeonsNames.match1} </span>
              {team1Results.match1 && team2Results.match1 && (
                <Badge variant="outline" className=" py-1 px-3 bg-gray-700 text-white">
                  {getMatchResult('match1') && getMatchResult('match1').length > 0 ? getMatchResult('match1') : null}
                </Badge>
              )}
            </div>
            <Separator className="bg-gray-600" />
            <div className="flex justify-between items-center">
              <span className="font-medium">2: {dungeonsNames.match2}</span>
              {team1Results.match2 && team2Results.match2 && (
                <Badge variant="outline" className=" py-1 px-3 bg-gray-700 text-white ">
                  {getMatchResult('match2')}
                </Badge>
              )}
            </div>
            {(needsTiebreaker(team1Results, team2Results) || team1Results.match3 !== null) && (
              <>
                <Separator className="bg-gray-600" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tiebreaker:</span>
                  {team1Results.match3 && team2Results.match3 && (
                    <Badge variant="outline" className="py-1 px-3 bg-gray-700 text-white">
                      {getMatchResult('match3') ? getMatchResult('match3') : null}
                    </Badge>
                  )}
                </div>
              </>
            )}
            {myMatchResults?.confirm && opponentMatchResults?.confirm && (
              <>
                <Separator className="bg-gray-600" />
                <div className="mt-6 space-y-2">
                  <h3 className="text-xl font-bold flex items-center">
                    <Trophy className="mr-2 h-6 w-6 text-fdb202" />
                    Final Score
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{myTeam?.name}:</span>
                    <Badge variant="secondary" className="text-lg py-1 px-3 bg-blue-600 text-white">
                      {team1Points} points
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{opponentTeam}:</span>
                    <Badge variant="secondary" className="text-lg py-1 px-3 bg-red-600 text-white">
                      {team2Points} points
                    </Badge>
                  </div>
                  <div className="text-center mt-4">
                    <span className="font-bold text-xl text-fdb202">
                      {team1Points > team2Points
                        ? `${myTeam?.team_slug} Wins!`
                        : team2Points > team1Points
                          ? `${opponentTeam} Wins!`
                          : "It's a Tie!"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-[#011624] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-white">Mythic Trials Results - Round {round}</h1>
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="bg-red-800 text-white border border-red-600">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {myTeam?.team_slug && renderTeamCard(myTeam?.team_slug.toLowerCase().replace(/\s/g, '-'))}
              {opponentTeam && renderTeamCard(opponentTeam.toLowerCase().replace(/\s/g, '-'))}
            </div>
          </div>
          <div className={bothTeamsConfirmed ? `lg:col-span-3` : `lg:col-span-1`}>
            {renderMatchOverview()}{' '}
            {bothTeamsConfirmed && (
              <Button
                onClick={() => {
                  router.push('/my-matches')
                }}
                className="mt-4"
              >
                Gå tilbake
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

async function updateMatchResults(contact_person: string, round: number, result: number | null, match: number) {
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

async function confirmResults(contact_person: string, round: number, winner: boolean, confirm: boolean) {
  const { error } = await supabase
    .from('match_results')
    .update({
      confirm: confirm,
      winner: winner,
    })
    .eq('contact_person', contact_person)
    .eq('round', round)

  if (error) {
    console.error(error)
    return error
  }
}

async function createMatchResultsIfNotExists({
  email,
  round,
  homeTeam,
  awayTeam,
  myTeamSlug,
}: {
  email: string
  round: number
  homeTeam: string
  awayTeam: string
  myTeamSlug: string
}) {
  await supabase
    .from('pick_ban')
    .select('*')
    .eq('contact_person', email)
    .eq('round', round)
    .then((res) => {
      const pickBanCompletedForRound =
        res.data?.find((e) => e.team_slug === homeTeam || (e.team_slug === awayTeam && e.round === round))
          ?.completed === true
      const matchUUID = res.data?.find(
        (e) => e.team_slug === homeTeam || (e.team_slug === awayTeam && e.round === round),
      ).matchUUID

      if (res.data && res.data.length > 0 && pickBanCompletedForRound) {
        supabase
          .from('match_results')
          .select('*')
          .eq('contact_person', email)
          .eq('round', round)
          .then((res) => {
            if (res.data && res.data.length === 0) {
              create_match_results({
                matchResults: {
                  contact_person: email as string,
                  opponent: myTeamSlug === homeTeam ? awayTeam : homeTeam,
                  round: round,
                  team_slug: myTeamSlug,
                  matchUUID: matchUUID,
                },
              })
            }
          })
      }
    })
}

async function getMatchresults(contact_person: string, round: number) {
  const { data, error } = await supabase
    .from('match_results')
    .select('*')
    .eq('contact_person', contact_person)
    .eq('round', round)

  if (error) {
    console.error(error)
    return error
  }

  return data
}
