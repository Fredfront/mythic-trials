import { groq } from 'next-sanity'
import { client } from '../../../sanity/lib/client'
import { MythicPlusTeam } from '../page'

export async function getTeamByNameFromSanity(teamSlug: string) {
  const teams = await client.fetch(groq`*[_type == 'MythicPlusTeam' && teamSlug == $teamSlug]`, { teamSlug })
  return teams?.[0] as MythicPlusTeam
}
