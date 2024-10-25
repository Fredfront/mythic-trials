'use client'

import { getAllTeams, MythicPlusTeam } from '@/app/api/getAllTeams'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, CheckCircle, Twitch } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface DiscordMember {
  user: {
    id: string
    username: string
    discriminator: string
    avatar: string | null
  }
  nick?: string
  roles: string[]
  joined_at: string
  premium_since?: string
  deaf: boolean
  mute: boolean
}

interface DiscordRole {
  id: string
  name: string
}

export default function Component() {
  const [members, setMembers] = useState<DiscordMember[] | undefined>(undefined)
  const [sanityTeams, setSanityTeams] = useState<MythicPlusTeam[] | undefined>(undefined)
  const [roles, setRoles] = useState<DiscordRole[] | undefined>(undefined)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      const [membersResponse, teamsResponse, rolesResponse] = await Promise.all([
        fetch('/api/discord/members'),
        getAllTeams(),
        fetch('/api/discord/roles'),
      ])
      const [membersData, rolesData] = await Promise.all([membersResponse.json(), rolesResponse.json()])
      setMembers(membersData)
      setSanityTeams(teamsResponse)
      setRoles(rolesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, [toast])

  const handleAssignRoles = async (teamSlug: string, userIds: string[]) => {
    setLoading(true)
    try {
      const response = await fetch('/api/discord/assign-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamSlug, userIds }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Roles assigned successfully!',
        })
        await fetchData()
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error assigning roles:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while assigning roles.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!members || !sanityTeams || !roles) {
    return <SkeletonLoader />
  }

  const roleIdToNameMap = new Map<string, string>(roles?.map((role) => [role.id, role.name.toLowerCase()]))

  const discordMembersMap = new Map<string, DiscordMember>(
    members?.map((member) => [member.user.username.toLowerCase(), member]),
  )

  const teamsWithMembers = sanityTeams.map((team) => {
    const playersWithMembers = team.players.map((player) => {
      const discordName = player.discordName.toLowerCase()
      const discordMember = discordMembersMap.get(discordName)

      let memberRoleNames: string[] = []
      if (discordMember) {
        memberRoleNames = discordMember.roles
          .map((roleId) => roleIdToNameMap.get(roleId))
          .filter(Boolean)
          .map((roleName) => roleName!.toLowerCase())
      }

      return {
        player,
        discordMember,
        memberRoleNames,
      }
    })

    return {
      team,
      playersWithMembers,
    }
  })

  const membersWithoutTeams = members.filter(
    (member) =>
      !sanityTeams.some((team) =>
        team.players.some((player) => player.discordName.toLowerCase() === member.user.username.toLowerCase()),
      ),
  )

  return (
    <>
      <Link className="p-2 flex gap-2 hover:underline hover:font-semibold" href="/superadmin">
        <ArrowLeft /> Gå tilbake
      </Link>
      <div className="container mx-auto p-4 text-gray-100">
        <h1 className="text-3xl font-bold mb-6">Discord Teams</h1>
        <Tabs defaultValue="teams" className="space-y-4 ">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="teams" className="data-[state=active]:bg-gray-700 ">
              Teams
            </TabsTrigger>
            <TabsTrigger value="unassigned" className="data-[state=active]:bg-gray-700">
              Unassigned Members
            </TabsTrigger>
          </TabsList>
          <TabsContent value="teams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamsWithMembers.map(({ team, playersWithMembers }) => {
                const userIds = playersWithMembers
                  .map(({ discordMember }) => discordMember?.user.id)
                  .filter(Boolean) as string[]

                const membersWithRoles = playersWithMembers.filter(
                  ({ memberRoleNames }) =>
                    memberRoleNames.includes('deltager') && memberRoleNames.includes(team.teamName.toLowerCase()),
                )

                const allMembersHaveRoles = membersWithRoles.length === playersWithMembers.length
                const someMembersHaveRoles = membersWithRoles.length > 0 && !allMembersHaveRoles

                return (
                  <Card key={team._id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle>{team.teamName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {someMembersHaveRoles && (
                        <Alert variant="warning" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Warning</AlertTitle>
                          <AlertDescription>Some team members are missing the required roles.</AlertDescription>
                        </Alert>
                      )}
                      {allMembersHaveRoles && (
                        <Alert variant="success" className="mb-4">
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Success</AlertTitle>
                          <AlertDescription>All team members have the required roles.</AlertDescription>
                        </Alert>
                      )}
                      <ul className="space-y-4">
                        {playersWithMembers.map(({ player, discordMember, memberRoleNames }) => (
                          <li
                            key={player.discordName + player.characterName + team._id}
                            className="flex items-center space-x-4"
                          >
                            <Avatar>
                              <AvatarImage
                                src={
                                  discordMember?.user.avatar
                                    ? `https://cdn.discordapp.com/avatars/${discordMember.user.id}/${discordMember.user.avatar}.png`
                                    : undefined
                                }
                              />
                              <AvatarFallback>{player.characterName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{player.characterName}</p>
                              <p className="text-sm text-gray-400">{player.realmName}</p>
                              <p className="text-sm text-gray-400">
                                Discord: {discordMember ? discordMember.user.username : 'Not found'}
                              </p>
                              {memberRoleNames.includes('deltager') &&
                              memberRoleNames.includes(team.teamName.toLowerCase()) ? (
                                <Badge variant="success">Roles Assigned</Badge>
                              ) : (
                                <Badge variant="destructive">Missing Roles</Badge>
                              )}
                            </div>
                            {player.twitchChannel && (
                              <a target="_blank" href={`https://twitch.tv/${player.twitchChannel}`}>
                                <Badge variant="secondary" className="ml-auto gap-1">
                                  {player.twitchChannel} <Twitch width={12} height={12} />
                                </Badge>
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    {!allMembersHaveRoles && (
                      <div className="px-6 pb-6">
                        <Button
                          disabled={loading}
                          onClick={() => handleAssignRoles(team.teamName, userIds)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {loading ? 'Loading...' : 'Assign Roles'}
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          <TabsContent value="unassigned">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Unassigned Discord Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {membersWithoutTeams.map((member) => (
                    <div key={member.user.id} className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={
                            member.user.avatar
                              ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
                              : undefined
                          }
                        />
                        <AvatarFallback>{member.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.username}</p>
                        <p className="text-sm text-gray-400">
                          Joined: {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

function SkeletonLoader() {
  return (
    <div className="container mx-auto p-4">
      <Skeleton className="h-10 w-48 mb-6 bg-gray-700" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-gray-700" />
                      <Skeleton className="h-3 w-20 bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
