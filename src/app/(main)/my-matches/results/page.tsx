import { serverClient } from '@/utils/supabase/newServer'

import React from 'react'
import Result, { TMatchResults, TTeam } from './components/Result'
import { PickAndBansType } from '../components/Matches'

export const revalidate = 0

export default async function Page()
{
  const { data } = await serverClient().from('pick_ban').select('*')
  const teams = await serverClient().from('teams').select('*')
  const match_results = await serverClient().from('match_results').select('*')

  const pickAndBanData = data as PickAndBansType[]
  const teamsData = (teams.data as TTeam[]) || []
  const matchResultsData = (match_results.data as TMatchResults[]) || []

  return (
    <>
      <Result pickAndBanData={pickAndBanData} teams={teamsData} matchResults={matchResultsData} />
    </>
  )
}
