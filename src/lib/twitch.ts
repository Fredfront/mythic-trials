// lib/twitch.ts

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token'

export async function getTwitchAccessToken(): Promise<string> {
  const params = new URLSearchParams()
  params.append('client_id', process.env.TWITCH_CLIENT_ID!)
  params.append('client_secret', process.env.TWITCH_CLIENT_SECRET!)
  params.append('grant_type', 'client_credentials')

  const response = await fetch(`${TWITCH_TOKEN_URL}?${params.toString()}`, {
    method: 'POST',
  })

  if (!response.ok) {
    console.error('Failed to fetch Twitch access token')
  }

  const data = await response.json()
  return data.access_token
}

// lib/twitch.ts

export interface StreamData {
  id: string
  user_id: string
  user_login: string
  user_name: string
  game_id: string
  game_name: string
  type: string
  title: string
  viewer_count: number
  started_at: string
  language: string
  thumbnail_url: string
  tag_ids: string[]
  is_mature: boolean
}

export async function getLiveStreams(accessToken: string, channels: string[]): Promise<string[]> {
  const baseUrl = 'https://api.twitch.tv/helix/streams'
  const url = new URL(baseUrl)
  channels.forEach((channel) => url.searchParams.append('user_login', channel))

  const response = await fetch(url.toString(), {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    console.error('Failed to fetch live streams')
  }

  const data = await response.json()
  const liveChannels = data?.data?.map((stream: StreamData) => stream.user_login.toLowerCase())
  return liveChannels
}

export interface TeamLiveStatus {
  teamSlug: string
  twitch_channels: string[]
}
