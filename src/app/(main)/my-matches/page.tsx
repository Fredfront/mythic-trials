import React from 'react'
import { ServerClient } from '@/utils/supabase/server'
import { getAllTeams } from '@/app/api/getAllTeams'
import { Matches } from './components/Matches'
import { Match, MatchRecord, Team, TeamMatch, TournamentSchedule } from '../../../../types'
import { matches } from 'lodash'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CalendarX } from 'lucide-react'

export const revalidate = 0

export default async function Page()
{
  // Fetch teams
  const teamsResponse = await ServerClient.from('teams').select('*')

  const teams: Team[] = teamsResponse.data ?? []

  const pickAndBansTable = await ServerClient.from('pick_ban').select('*')
  const matchResultsTable = await ServerClient.from('match_results').select('*')
  const sanityTeamData = await getAllTeams()
  const rounds = await ServerClient.from('rounds').select('*')

  // Fetch matches
  const matchesResponse = await ServerClient.from('matches')
    .select('*')
    .order('round', { ascending: true })
    .order('round_startTime', { ascending: true })

  const matchesData = matchesResponse.data as MatchRecord[]


  if (!matchesData || matchesData.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 mt-20">
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
    <div className="mb-10">
      <Matches
        schedule={createSortedRounds(matchesData, teams)}
        matchResults={matchResultsTable.data ?? []}
        sanityTeamData={sanityTeamData}
        pickAndBansData={pickAndBansTable.data ?? []}
        teams={teams}
        rounds={rounds.data ?? []}
      />
    </div>
  )
}



export function createSortedRounds(matchesData: MatchRecord[], teams: Team[]): TournamentSchedule
{

  // Create a map of team ID to team data for easy lookup
  const teamMap = new Map<string, Team>()
  teams.forEach((team) =>
  {
    teamMap.set(team.id, team)
  })

  // Group matches by round
  const scheduleMap: { [ round: number ]: Match[] } = {}

  matchesData?.forEach((match) =>
  {
    const roundNumber = match.round
    if (!scheduleMap[ roundNumber ]) {
      scheduleMap[ roundNumber ] = []
    }

    const homeTeam = teamMap.get(match.home_team_id)
    const awayTeam = teamMap.get(match.away_team_id)

    if (!homeTeam || !awayTeam) {
      console.warn(`Missing team data for match_uuid: ${match.match_uuid}`)
      return // Skip this match if team data is incomplete
    }

    // Create TeamMatch objects
    const homeTeamMatch: TeamMatch = {
      name: homeTeam.name,
      contactPerson: homeTeam.contact_person,
      team_slug: homeTeam.team_slug,
      round: match.round,
      home: true,
      roundDate: match.round_date,
      matchUUID: match.match_uuid,
      round_startTime: match.round_startTime,
      rescheduled: match.rescheduled,
      rescheduled_round_date: match.rescheduled_round_date,
      rescheduled_round_startTime: match.rescheduled_round_startTime,
      home_team_agree_reschedule: match.home_team_agree_reschedule,
      away_team_agree_reschedule: match.away_team_agree_reschedule,
      home_team_proposed_rescheduled_round_date: match.home_team_proposed_rescheduled_round_date,
      home_team_proposed_rescheduled_round_startTime: match.home_team_proposed_rescheduled_round_startTime,
      away_team_proposed_rescheduled_round_date: match.away_team_proposed_rescheduled_round_date,
      away_team_proposed_rescheduled_round_startTime: match.away_team_proposed_rescheduled_round_startTime,
      id: match.id,
    }

    const awayTeamMatch: TeamMatch = {
      name: awayTeam.name,
      contactPerson: awayTeam.contact_person,
      team_slug: awayTeam.team_slug,
      round: match.round,
      home: false,
      roundDate: match.round_date,
      matchUUID: match.match_uuid,
      round_startTime: match.round_startTime,
      rescheduled: match.rescheduled,
      rescheduled_round_date: match.rescheduled_round_date,
      rescheduled_round_startTime: match.rescheduled_round_startTime,
      home_team_agree_reschedule: match.home_team_agree_reschedule,
      away_team_agree_reschedule: match.away_team_agree_reschedule,
      home_team_proposed_rescheduled_round_date: match.home_team_proposed_rescheduled_round_date,
      home_team_proposed_rescheduled_round_startTime: match.home_team_proposed_rescheduled_round_startTime,
      away_team_proposed_rescheduled_round_date: match.away_team_proposed_rescheduled_round_date,
      away_team_proposed_rescheduled_round_startTime: match.away_team_proposed_rescheduled_round_startTime,
      id: match.id,
    }

    // Create Match object
    const mappedMatch: Match = {
      teams: [ homeTeamMatch, awayTeamMatch ],
      featured: match.featured,
    }

    scheduleMap[ roundNumber ].push(mappedMatch)
  })

  // Convert scheduleMap to TournamentSchedule (sorted rounds)
  const sortedRounds: TournamentSchedule = Object.keys(scheduleMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((roundNumber) =>
    {
      // Optionally, sort matches within each round by start time
      const sortedMatches = scheduleMap[ roundNumber ].sort((a, b) =>
      {
        const timeA = a.teams[ 0 ].round_startTime || '00:00:00'
        const timeB = b.teams[ 0 ].round_startTime || '00:00:00'
        return timeA.localeCompare(timeB)
      })
      return sortedMatches
    })

  return sortedRounds
}