import { groq } from 'next-sanity'
import { client } from '../../../sanity/lib/client'
import { MythicPlusTeam } from '../page'

export async function getTeamByNameFromSanity(teamName: string) {
  const teams = await client.fetch(groq`*[_type == 'MythicPlusTeam' && teamName == $teamName]`, { teamName })
  return teams?.[0] as MythicPlusTeam
}
