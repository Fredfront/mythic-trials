import { NextRequest, NextResponse } from 'next/server'

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!

export async function POST(req: NextRequest) {
  const { teamSlug, userIds } = await req.json()

  if (!teamSlug || !Array.isArray(userIds)) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  try {
    // Assign roles
    await assignRolesToUsers(teamSlug, userIds)

    return NextResponse.json({ message: 'Roles assigned successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error assigning roles:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

async function assignRolesToUsers(teamSlug: string, userIds: string[]) {
  // IDs of roles
  const generalRoleName = 'Deltager' // Replace with your general role name
  const generalRoleId = await getRoleIdByName(generalRoleName)
  const teamRoleId = await getOrCreateRole(teamSlug)

  // Assign roles to each user
  for (const userId of userIds) {
    await assignRoleToUser(userId, generalRoleId)
    await assignRoleToUser(userId, teamRoleId)
  }
}

async function getRoleIdByName(roleName: string): Promise<string> {
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

  const role = roles.find((r: any) => r.name === roleName)

  if (!role) {
    throw new Error(`Role "${roleName}" not found`)
  }

  return role.id
}

async function getOrCreateRole(roleName: string): Promise<string> {
  // Fetch existing roles
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

  // Check if role already exists
  let role = roles.find((r: any) => r.name === roleName)

  if (role) {
    return role.id
  }

  // Generate a random color
  const randomColor = Math.floor(Math.random() * 0xffffff)

  // Create new role with a random color
  const createRoleResponse = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify({
      name: roleName,
      mentionable: true,
      color: randomColor,
    }),
  })

  if (!createRoleResponse.ok) {
    throw new Error('Failed to create role')
  }

  role = await createRoleResponse.json()
  return role.id
}

async function assignRoleToUser(userId: string, roleId: string) {
  const response = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${userId}/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    const errorMessage = (errorData as { message: string }).message
    throw new Error(`Failed to assign role: ${errorMessage}`)
  }
}
