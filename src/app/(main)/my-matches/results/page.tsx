import { serverClient } from '@/utils/supabase/newServer'

import React from 'react'
import Result from './components/Result'
import { MatchResultsComponent } from '@/components/match-results'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PickAndBansType, TTeam, TMatchResults } from '../../../../../supabase/dbFunctions'

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
      <Link href='/my-matches' className="mb-6  cursor-pointer flex gap-1 p-2">
        <ArrowLeft /> Gå tilbake
      </Link>
      <MatchResultsComponent pickAndBanData={pickAndBanData} teams={teamsData} matchResults={matchResultsData} />
    </>
  )
}
