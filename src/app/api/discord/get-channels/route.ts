// src/app/api/discord/get-channels/route.ts

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const token = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID

    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    })

    if (!channelsResponse.ok) {
      throw new Error('Failed to fetch channels: ' + channelsResponse.statusText)
    }

    const channels = await channelsResponse.json()

    return NextResponse.json({ channels }, { status: 200 })
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json({ error: 'Failed to fetch channels', details: (error as Error).message }, { status: 500 })
  }
}
