// src/app/api/delete-discord-round/route.ts

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { round } = body

    if (typeof round !== 'number') {
      return NextResponse.json({ error: 'Round number and Guild ID are required.' }, { status: 400 })
    }

    const token = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID

    // Function to find and delete the category and its child channels
    async function deleteCategoryAndChannels(round: number): Promise<void> {
      // Fetch all channels in the guild
      const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        headers: {
          Authorization: `Bot ${token}`,
        },
      })

      if (!channelsResponse.ok) {
        throw new Error('Failed to fetch channels in guild: ' + channelsResponse.statusText)
      }

      const channels = await channelsResponse.json()

      // Find the category named 'Round X'
      const categoryName = `Round ${round}`
      const categoryChannel = channels.find((channel: any) => channel.type === 4 && channel.name === categoryName)

      if (!categoryChannel) {
        throw new Error(`Category for Round ${round} not found.`)
      }

      const categoryId = categoryChannel.id

      // Find all channels under the category
      const childChannels = channels.filter((channel: any) => channel.parent_id === categoryId)

      // Delete all child channels
      for (const channel of childChannels) {
        const deleteChannelResponse = await fetch(`https://discord.com/api/v10/channels/${channel.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bot ${token}`,
          },
        })

        if (!deleteChannelResponse.ok) {
          const errorResult = await deleteChannelResponse.json()
          console.error(`Failed to delete channel ${channel.id}:`, errorResult)
          // Continue deleting other channels even if one fails
          continue
        }
      }

      // Delete the category channel
      const deleteCategoryResponse = await fetch(`https://discord.com/api/v10/channels/${categoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bot ${token}`,
        },
      })

      if (!deleteCategoryResponse.ok) {
        const errorResult = await deleteCategoryResponse.json()
        throw new Error(
          `Failed to delete category channel: ${errorResult.message || deleteCategoryResponse.statusText}`,
        )
      }
    }

    // Delete the category and its channels
    await deleteCategoryAndChannels(round)

    return NextResponse.json({ message: `Round ${round} and its channels have been deleted.` }, { status: 200 })
  } catch (error) {
    // Handle errors
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 })
  }
}
