// src/app/api/discord/send-bug-report/route.ts

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Parse the JSON body from the request
    const { title, description, environment, from } = await request.json()

    // Validate input fields
    if (!title || !description || !environment || !from) {
      return NextResponse.json(
        { error: 'Title, description, environment details, and sender email are required.' },
        { status: 400 },
      )
    }

    // Optional: Validate email format if not anonymous
    if (from !== 'Anonymous') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(from)) {
        return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 })
      }
    }

    // Retrieve Discord credentials from environment variables
    const token = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID

    if (!token || !guildId) {
      return NextResponse.json({ error: 'Discord bot token or guild ID not configured.' }, { status: 500 })
    }

    // Define the Discord channel ID where bug reports will be sent
    const channelId = '1300398270773858324' // Replace with your actual channel ID

    if (!channelId) {
      return NextResponse.json({ error: 'Discord channel ID is not configured.' }, { status: 500 })
    }

    // Construct the message to be sent to Discord using embeds
    const finalMessage = {
      embeds: [
        {
          title: `Bug Report: ${title}`,
          fields: [
            {
              name: 'Description',
              value: description,
            },
            {
              name: 'Environment',
              value: environment,
            },
            {
              name: 'From',
              value: from,
            },
          ],
          color: 0xff0000, // Optional: Set a color for the embed (red in this case)
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
