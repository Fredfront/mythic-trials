import client from '../../../sanity/lib/client'
import { GET_ALL_TEAMS } from '../../../sanity/lib/queries'

export async function getAllTeams() {
  const teams = await client.fetch({
    query: GET_ALL_TEAMS,
    config: {
      next: {
        revalidate: 30,
      },
    },
  })
  return teams as MythicPlusTeam[]
}
export type MythicPlusTeam = {
  _updatedAt: string
  teamName: string
  teamSlug: string
  teamImage: ImageAsset
  contactPerson: string
  players: Player[]
  _createdAt: string
  _rev: string
  _type: string
  _key: string
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
  characterName: string
  alts: AltPlayer[]
}

export type AltPlayer = {
  altRealmName: string
  altCharacterName: string
}
