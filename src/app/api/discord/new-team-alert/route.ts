// src/app/api/discord/send-bug-report/route.ts

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Parse the JSON body from the request
    const { teamName, from, username } = await request.json()

    // Validate input fields
    if (!teamName || !from) {
      return NextResponse.json({ error: 'Title, description, and sender email are required.' }, { status: 400 })
    }

    // Retrieve Discord credentials from environment variables
    const token = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID

    if (!token || !guildId) {
      return NextResponse.json({ error: 'Discord bot token or guild ID not configured.' }, { status: 500 })
    }

    // Define the Discord channel ID where bug reports will be sent
    const channelId = '1300772675035070486' // Replace with your actual channel ID

    if (!channelId) {
      return NextResponse.json({ error: 'Discord channel ID is not configured.' }, { status: 500 })
    }

    // Construct the message to be sent to Discord using embeds
    const finalMessage = {
      embeds: [
        {
          title: `New team signed up: ${teamName}`,
          fields: [
            { name: 'From', value: from },
            { name: 'Discord user', value: username },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Send the message to the specified Discord channel with embeds
    const sendMessageResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalMessage),
    })

    // Handle Discord API response
    if (!sendMessageResponse.ok) {
      const errorData = await sendMessageResponse.json()
      throw new Error(errorData.message || 'Failed to send bug report.')
    }

    // Respond with success if the message was sent successfully
    return NextResponse.json({ message: 'Bug report sent successfully.' }, { status: 200 })
  } catch (error) {
    console.error('Error sending bug report:', error)
    return NextResponse.json(
      { error: 'Failed to send bug report.', details: (error as Error).message },
      { status: 500 },
    )
  }
}
