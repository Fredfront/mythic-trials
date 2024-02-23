import client from '../../../sanity/lib/client'
import { GET_ALL_TEAMS } from '../../../sanity/lib/queries'
import {} from '../page'

export async function getAllTeams() {
  const teams = await client.fetch({
    query: GET_ALL_TEAMS,
  })
  return teams as MythicPlusTeam[]
}
export type MythicPlusTeam = {
  _updatedAt: string
  teamName: string
  teamSlug: string
  teamImage: ImageAsset
  players: Player[]
  _createdAt: string
  _rev: string
  _type: string
  _id: string
}
type ImageAsset = {
  _type: string
  asset: {
    _ref: string
    _type: string
  }
}

export type Player = {
  realmName: string
  _type: string
  characterName: string
  _key: string
}
