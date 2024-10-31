import { NextResponse } from 'next/server'

const DISCORD_CHANNEL_ID = '1297304925537308758'
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!

export async function GET() {
  try {
    // Send a request to create a Discord invite link for a specific channel
    const response = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/invites`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_uses: 7,
        unique: true, // Ensures a new invite link each time
        max_age: 604800,
      }),
    })

    if (!response.ok) {
      console.error('Failed to create Discord invite link:', await response.json())
      return NextResponse.json({ error: 'Failed to create invite link' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ invite_link: `https://discord.gg/${data.code}` })
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 })
  }
}
