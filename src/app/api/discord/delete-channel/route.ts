// src/app/api/discord/delete-channel/route.ts

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { channelId } = body

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required.' }, { status: 400 })
    }

    const token = process.env.DISCORD_BOT_TOKEN

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bot ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete channel.')
    }

    return NextResponse.json({ message: 'Channel deleted successfully.' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting channel:', error)
    return NextResponse.json({ error: 'Failed to delete channel', details: (error as Error).message }, { status: 500 })
  }
}
