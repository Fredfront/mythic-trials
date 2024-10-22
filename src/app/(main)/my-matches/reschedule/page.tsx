import { getAllTeams } from '@/app/api/getAllTeams'
import { InfoBoxComponent } from '@/components/info-box'
import RescheduleMatch from '@/components/reschedule-match'
import { ServerClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MatchRecord, SupabaseTeamsType, SupabaseTeamType } from '../../../../../types'

export const revalidate = 0

const page = async () =>
{
  const matches = (await (await ServerClient.from('matches').select('*')).data) as MatchRecord[]
  const teams = (await (await ServerClient.from('teams').select('*')).data) as SupabaseTeamType[]
  const rounds = (await (await ServerClient.from('rounds').select('*')).data) as { round: number, round_date: string }[]

  return (
    <div>
      <Link className="flex gap-2 p-4 hover:underline" href="/my-matches">
        <ArrowLeft /> Gå tilbake
      </Link>
      <RescheduleMatch matchesFromServer={matches} teams={teams} rounds={rounds} />
    </div>
  )
}

export default page
