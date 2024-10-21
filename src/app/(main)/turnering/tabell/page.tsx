import SimplifiedLeaderboard from '@/app/components/SimplifiedLeaderboard'
import { ServerClient } from '@/utils/supabase/server'
import React from 'react'
import ResultsTable from './ResultsTable'
import { getAllTeams } from '@/app/api/getAllTeams'

async function Page()
{
  const matchResultsTable = await ServerClient.from('match_results').select('*')
  const sanityTeamData = await getAllTeams()


  return <ResultsTable matchResults={matchResultsTable.data ?? []} sanityTeamData={sanityTeamData} />
}

export default Page

