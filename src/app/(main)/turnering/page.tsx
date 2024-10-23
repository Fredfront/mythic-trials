// src/app/page.tsx

import React from 'react'
import { ServerClient } from '@/utils/supabase/server'
import Matches from './components/Matches'
import { getAllTeams } from '@/app/api/getAllTeams'
import { Team, MatchRecord, Match, TeamMatch, TournamentSchedule } from '../../../../types'
import { createSortedRounds } from '../my-matches/page'

export const revalidate = 1 // Disables ISR; adjust as needed

async function Page() {
  // Fetch teams
  const teamsResponse = await ServerClient.from('teams').select('*')
  const teams: Team[] = teamsResponse.data ?? []
  // Fetch matches
  const matchesResponse = await ServerClient.from('matches')
    .select('*')
    .order('round', { ascending: true })
    .order('round_startTime', { ascending: true })
  const matchesData = matchesResponse.data as MatchRecord[]
  // Optionally, fetch other tables if needed
  const pickAndBansTable = await ServerClient.from('pick_ban').select('*')
  const matchResultsTable = await ServerClient.from('match_results').select('*')
  const sanityTeamData = await getAllTeams()

  return (
    <Matches
      schedule={createSortedRounds(matchesData, teams)}
      matchResults={matchResultsTable.data ?? []}
      pickAndBanData={pickAndBansTable.data ?? []}
      sanityTeamData={sanityTeamData}
    />
  )
}

export default Page
