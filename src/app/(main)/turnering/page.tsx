import React from 'react'
import { ServerClient } from '@/utils/supabase/server'
import Matches from './components/Matches'
import { TTeam } from '../my-matches/results/components/Result'
import { getAllTeams } from '@/app/api/getAllTeams'
export const revalidate = 0

async function Page() {
  const teams = await ServerClient.from('teams').select('*')
  const pickAndBansTable = await ServerClient.from('pick_ban').select('*')
  const matchResultsTable = await ServerClient.from('match_results').select('*')
  const sanityTeamData = await getAllTeams()
  const sortedTeams = teams.data?.sort((a: { points: number }, b: { points: number }) => a.points - b.points) as TTeam[]

  return (
    <Matches
      teams={sortedTeams ?? []}
      matchResults={matchResultsTable.data ?? []}
      pickAndBanData={pickAndBansTable.data ?? []}
      sanityTeamData={sanityTeamData}
    />
  )
}

export default Page
