import { groq } from 'next-sanity'
import client from '../../../../sanity/lib/client'

export async function getTyrannicalLeaderboardData() {
  const leaderboard = await client.fetch({
    query: groq`*[_type == "tyrannicalLeaderboard"] {
      dungeon,
      baseTimer,
      teams
    }`,
    config: {
      next: { revalidate: 1 },
    },
  })

  return leaderboard as LeaderboardData
}

export type TeamEntry = {
  _key: string
  seconds: number
  minutes: number
  team: {
    _key: string
    _ref: string
  }
}

type LeaderboardEntry = {
  dungeon: string
  baseTimer: string
  teams: TeamEntry[]
}

export type LeaderboardData = LeaderboardEntry[]
