import { NextRequest, NextResponse } from 'next/server'

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!

export async function GET(req: NextRequest) {
  try {
    const rolesResponse = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/roles`, {
      method: 'GET',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    })

    if (!rolesResponse.ok) {
      throw new Error('Failed to fetch roles')
    }

    const roles = await rolesResponse.json()
    return NextResponse.json(roles)
  } catch (error: any) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
