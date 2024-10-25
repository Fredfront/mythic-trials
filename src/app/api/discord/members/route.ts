// app/api/discord/members/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const GUILD_ID = process.env.DISCORD_GUILD_ID!
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!

  const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000`, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json({ error: errorData.message }, { status: response.status })
  }

  const members = await response.json()
  return NextResponse.json(members)
}
