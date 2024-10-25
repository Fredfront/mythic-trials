// src/app/api/create-discord-channels/route.ts

import { NextResponse } from 'next/server'
import { ServerClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { round } = body

    if (typeof round !== 'number') {
      return NextResponse.json({ error: 'Round number is required.' }, { status: 400 })
    }

    const token = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID

    // Fetch matches for the given round, including team names
    const { data: matches, error } = await ServerClient.from('matches')
      .select(
        `
        id,
        home_team:home_team_id (
          name
        ),
        away_team:away_team_id (
          name
        )
      `,
      )
      .eq('round', round)

    if (error) {
      throw new Error('Error fetching matches: ' + error.message)
    }

    if (matches.length === 0) {
      return NextResponse.json({ error: 'No matches found for the given round.' }, { status: 404 })
    }

    // Function to get or create the category for the round
    async function getOrCreateCategory(round: number): Promise<string> {
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

      // Look for a category named 'Round X'
      const categoryName = `Round ${round}`
      let categoryChannel = channels.find((channel: any) => channel.type === 4 && channel.name === categoryName)

      if (categoryChannel) {
        // Category exists, return its ID
        return categoryChannel.id
      } else {
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

        return createCategoryResult.id
      }
    }

    // Get or create the category for the round
    const categoryId = await getOrCreateCategory(round)

    // Fetch existing channels under the category
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    })

    if (!channelsResponse.ok) {
      throw new Error('Failed to fetch channels in guild: ' + channelsResponse.statusText)
    }

    const allChannels = await channelsResponse.json()

    // Filter channels that are under the category
    const existingChannels = allChannels.filter((channel: any) => channel.parent_id === categoryId)

    // Map existing channel names for quick lookup
    const existingChannelNames = new Set(existingChannels.map((channel: any) => channel.name))

    // Fetch all roles in the guild
    const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    })

    if (!rolesResponse.ok) {
      throw new Error('Failed to fetch guild roles: ' + rolesResponse.statusText)
    }

    const roles = await rolesResponse.json()

    // Map roles by name for quick lookup
    const rolesByName = new Map(roles.map((role: any) => [role.name, role]))

    // Create channels for each match under the category
    const results = []

    for (const match of matches) {
      const matchWithType = match as unknown as { id: string; home_team: { name: string }; away_team: { name: string } }

      const channelName = `${matchWithType.home_team.name} vs ${matchWithType.away_team.name}`

      // Check if channel already exists
      if (existingChannelNames.has(channelName)) {
        console.log(`Channel "${channelName}" already exists. Skipping creation.`)
        results.push({ matchId: match.id, success: true, message: 'Channel already exists' })
        continue
      }

      // Find the roles for home and away teams
      const homeTeamRole = rolesByName.get(matchWithType.home_team.name) as any
      const awayTeamRole = rolesByName.get(matchWithType.away_team.name) as any

      if (!homeTeamRole || !awayTeamRole) {
        console.error(`Roles not found for teams in match ${match.id}`)
        results.push({ matchId: match.id, success: false, error: 'Team roles not found' })
        continue
      }

      // Permission overwrites
      const permissionOverwrites = [
        {
          id: guildId, // @everyone role
          type: 0, // Role
          deny: '1024', // Deny VIEW_CHANNEL
        },
        {
          id: homeTeamRole.id,
          type: 0, // Role
          allow: '1024', // Allow VIEW_CHANNEL
        },
        {
          id: awayTeamRole.id,
          type: 0, // Role
          allow: '1024', // Allow VIEW_CHANNEL
        },
      ]

      const url = `https://discord.com/api/v10/guilds/${guildId}/channels`
      const data = {
        name: channelName,
        type: 0, // 0 indicates a text channel
        parent_id: categoryId, // Assign channel to the category
        permission_overwrites: permissionOverwrites,
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        // Log the error and continue with the next match
        console.error(`Failed to create channel for match ${match.id}:`, result)
        results.push({ matchId: match.id, success: false, error: result })
        continue
      }

      // Success
      results.push({ matchId: match.id, success: true, channel: result })
    }

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    // Handle errors
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 })
  }
}
