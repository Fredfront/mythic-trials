import { groq } from 'next-sanity'
import client from '../../../../sanity/lib/client'

export async function getShowLeaderboard() {
  const leaderboard = await client.fetch({
    query: groq`*[_type == "featureToggle" && name == "Leaderboard"] {
      enabled
      }`,
    config: {
      cache: 'no-cache',
    },
  })

  return leaderboard as FeatureToggle[]
}

type FeatureToggle = {
  id: string
  enabled: boolean
}
