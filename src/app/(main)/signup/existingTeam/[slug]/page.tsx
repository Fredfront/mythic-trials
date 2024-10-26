import { getAllTeams } from '@/app/api/getAllTeams'
import ExistingTeam from './ExistingTeamClient'
import { ServerClient } from '@/utils/supabase/server'
import { SupabaseTeamType } from '../../../../../../types'

async function page() {
  const sanityTeams = await getAllTeams()
  const supabaseTeams = (await (await ServerClient.from('teams').select('*')).data) as SupabaseTeamType[]

  return <ExistingTeam sanityTeams={sanityTeams ?? []} supabaseTeams={supabaseTeams ?? []} />
}

export default page
