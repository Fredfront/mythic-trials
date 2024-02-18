import { client } from '../../../sanity/lib/client'
import { GET_ALL_TEAMS } from '../../../sanity/lib/queries'

export async function getAllTeams() {
  const teams = await client.fetch(GET_ALL_TEAMS)
  return teams
}
