import React from 'react'
import { ServerClient } from '@/utils/supabase/server'
import { getAllTeams } from '@/app/api/getAllTeams'
import { Matches } from './components/Matches'

export const revalidate = 0


export default async function Page()
{
  const teams = await ServerClient.from('teams').select('*')

  const pickAndBansTable = await ServerClient.from('pick_ban').select('*')
  const matchResultsTable = await ServerClient.from('match_results').select('*')
  const sanityTeamData = await getAllTeams()

  return (
    <div className="mb-10">
      <Matches
        teams={teams}
        matchResultsTable={matchResultsTable}
        pickAndBansTable={pickAndBansTable}
      />
    </div>
  )
}
