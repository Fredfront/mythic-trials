// src/app/api/discord/archive-channel/route.ts

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { channelId } = body

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required.' }, { status: 400 })
    }

    const token = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID

    // Fetch existing channels to find or create the 'Archived' category
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    })

    if (!channelsResponse.ok) {
      throw new Error('Failed to fetch channels in guild: ' + channelsResponse.statusText)
    }

    const channels = await channelsResponse.json()

    // Look for a category named 'Archived'
    const categoryName = 'Archived'
    let archivedCategory = channels.find((channel: any) => channel.type === 4 && channel.name === categoryName)

    if (!archivedCategory) {
      // Category doesn't exist, create it
      const createCategoryResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryName,
          type: 4, // 4 indicates a category channel
        }),
      })

      const createCategoryResult = await createCategoryResponse.json()

      if (!createCategoryResponse.ok) {
        throw new Error(
          'Failed to create category channel: ' + (createCategoryResult.message || createCategoryResponse.statusText),
        )
      }

      archivedCategory = createCategoryResult
    }

    // Move the channel to the 'Archived' category
    const modifyChannelResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent_id: archivedCategory.id,
      }),
    })

    if (!modifyChannelResponse.ok) {
      const errorData = await modifyChannelResponse.json()
      throw new Error(errorData.message || 'Failed to archive channel.')
    }

    return NextResponse.json({ message: 'Channel archived successfully.' }, { status: 200 })
  } catch (error) {
    console.error('Error archiving channel:', error)
    return NextResponse.json({ error: 'Failed to archive channel', details: (error as Error).message }, { status: 500 })
  }
}
