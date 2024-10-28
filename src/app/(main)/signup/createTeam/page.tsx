import { getAllTeams } from '@/app/api/getAllTeams'
import CreateTeam from './CreateTeam'
import { ServerClient } from '@/utils/supabase/server'
import { SupabaseTeamType } from '../../../../../types'

const page = async () =>
{
  const allTeams = await getAllTeams()
  const teams = await (await ServerClient.from('teams').select('*')).data as SupabaseTeamType[]

  if (!allTeams) return null

  return <CreateTeam allTeams={allTeams} supabaseTeams={teams} />
}

export default page
