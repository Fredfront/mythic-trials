// src/app/page.tsx

import React from 'react'
import { ServerClient } from '@/utils/supabase/server'
import Matches from './components/Matches'
import { getAllTeams } from '@/app/api/getAllTeams'
import { Team, MatchRecord, Match, TeamMatch, TournamentSchedule } from '../../../../types'

export const revalidate = 0 // Disables ISR; adjust as needed

async function Page()
{
  // Fetch teams
  const teamsResponse = await ServerClient.from('teams').select('*')
  if (teamsResponse.error) {
    console.error('Error fetching teams:', teamsResponse.error)
    return <div className="text-center text-red-500">Error loading teams.</div>
  }
  const teams: Team[] = teamsResponse.data

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

  // Optionally, fetch other tables if needed
  const pickAndBansTable = await ServerClient.from('pick_ban').select('*')
  const matchResultsTable = await ServerClient.from('match_results').select('*')
  const roundDates = await ServerClient.from('rounds').select('*')
  const sanityTeamData = await getAllTeams()

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
    <Matches
      schedule={sortedRounds}
      matchResults={matchResultsTable.data ?? []}
      pickAndBanData={pickAndBansTable.data ?? []}
      sanityTeamData={sanityTeamData}
    />
  )
}

export default Page



// src/types.ts

