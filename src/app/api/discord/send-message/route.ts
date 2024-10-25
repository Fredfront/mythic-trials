// src/app/api/discord/send-message/route.ts

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { channelName, message, roleId } = await request.json()

    // Validate input
    if (!channelName || !message) {
      return NextResponse.json({ error: 'Channel name and message are required.' }, { status: 400 })
    }

    const token = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID

    if (!token || !guildId) {
      return NextResponse.json({ error: 'Discord bot token or guild ID not configured.' }, { status: 500 })
    }

    // Fetch all channels in the guild
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    })

    if (!channelsResponse.ok) {
      throw new Error('Failed to fetch channels: ' + channelsResponse.statusText)
    }

    const channels = await channelsResponse.json()

    // Find the channel by name
    const channel = channels.find(
      (ch: any) => ch.name === channelName && ch.type === 0, // type 0 for text channels
    )

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found.' }, { status: 404 })
    }

    let finalMessage = message

    if (roleId) {
      // Append the role mention to the message
      finalMessage += `\n\n<@&${roleId}>`
    }

    // Send message to the channel
    const sendMessageResponse = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: finalMessage,
        allowed_mentions: {
          roles: roleId ? [roleId] : [],
        },
      }),
    })

    if (!sendMessageResponse.ok) {
      const errorData = await sendMessageResponse.json()
      throw new Error(errorData.message || 'Failed to send message.')
    }

    return NextResponse.json({ message: 'Message sent successfully.' }, { status: 200 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message', details: (error as Error).message }, { status: 500 })
  }
}
