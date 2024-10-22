import { Button } from '@/components/ui/button'
import { ServerClient } from '@/utils/supabase/server'
import React from 'react'
import { CreateMatches } from './components/CreateRoundRobin'
import { Match, MatchRecord, SupabaseTeamType, Team, TeamMatch, TournamentSchedule } from '../../../../types'

async function Page()
{
  const teams = (await (await ServerClient.from('teams').select('*')).data) as SupabaseTeamType[]
  const roundDates = (await (
    await ServerClient.from('rounds').select('*')
  ).data) as { round: number; round_date: string }[]

  // Fetch matches
  const matchesResponse = await ServerClient.from('matches')
    .select('*')
    .order('round', { ascending: true })
    .order('round_startTime', { ascending: true })
  if (matchesResponse.error) {
    console.error('Error fetching matches:', matchesResponse.error)
    return <div className="text-center text-red-500">Error loading matches.</div>
  }
  const matchesData = matchesResponse.data as MatchRecord[]

  // Create a map of team ID to team data for easy lookup
  const teamMap = new Map<string, Team>()
  teams.forEach((team) =>
  {
    teamMap.set(team.id, team)
  })

  // Group matches by round
  const scheduleMap: { [ round: number ]: Match[] } = {}

  matchesData.forEach((match) =>
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
      away_team_agree_reschedule: match.away_team_agree_reschedule,
      home_team_agree_reschedule: match.home_team_agree_reschedule,
      away_team_proposed_rescheduled_round_date: match.away_team_proposed_rescheduled_round_date,
      away_team_proposed_rescheduled_round_startTime: match.away_team_proposed_rescheduled_round_startTime,
      home_team_proposed_rescheduled_round_date: match.home_team_proposed_rescheduled_round_date,
      home_team_proposed_rescheduled_round_startTime: match.home_team_proposed_rescheduled_round_startTime,
      rescheduled: match.rescheduled,
      rescheduled_round_date: match.rescheduled_round_date,
      rescheduled_round_startTime: match.rescheduled_round_startTime,
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
      away_team_agree_reschedule: match.away_team_agree_reschedule,
      home_team_agree_reschedule: match.home_team_agree_reschedule,
      away_team_proposed_rescheduled_round_date: match.away_team_proposed_rescheduled_round_date,
      away_team_proposed_rescheduled_round_startTime: match.away_team_proposed_rescheduled_round_startTime,
      home_team_proposed_rescheduled_round_date: match.home_team_proposed_rescheduled_round_date,
      home_team_proposed_rescheduled_round_startTime: match.home_team_proposed_rescheduled_round_startTime,
      rescheduled: match.rescheduled,
      rescheduled_round_date: match.rescheduled_round_date,
      rescheduled_round_startTime: match.rescheduled_round_startTime,
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

  return (
    <>
      <div className="text-center p-4 text-4xl font-bold items-center justify-center flex flex-col gap-20">
        Dashbord
        <CreateMatches schedule={sortedRounds} teams={teams ?? []} roundDates={roundDates} email="" />
      </div>
    </>
  )
}

export default Page
