'use client'
import React, { useEffect, useState } from 'react'
import { getTeamData } from '../api/getTeamData'

type TeamCardProps = {
  teamName: string
}

const TeamCard: React.FC<TeamCardProps> = ({ teamName }: TeamCardProps) => {
  const [teamInfo, setTeamInfo] = useState<any>(null)

  useEffect(() => {
    const fetchTeamData = async () => {
      const data = await getTeamData({ teamName })
      setTeamInfo(data)
    }

    fetchTeamData()
  }, [teamName])

  return (
    <>
      {teamInfo && (
        <div className="w-96 bg-white p-3 m-3 text-black flex justify-between h-24">
          <div>image</div>
          {teamInfo.team.name}
        </div>
      )}
    </>
  )
}

export default TeamCard

type TeamMember = {
  id: number
  name: string
  role: string // You might want to specify the type of role if available
  // You can add more properties specific to team members if available
}

type Owner = {
  id: number
  name: string
  avatar: string | null // Assuming avatar can be a URL or null
  profile_privacy: any // You might want to specify the type if available
  patronLevel: any // You might want to specify the type if available
}

type ViewTeamDetailsApi = {
  customizations: {
    profile_banner_id: number
    biography: string
  }
  group: {
    id: number
    faction: string
    iconLogoUrl: string | null // Assuming iconLogoUrl can be a URL or null
    type: number
  }
  team: {
    charter_id: number
    group_id: number
    group_type: number
    platoon_id: number | null
    status: string
    name: string
    slug: string
    faction: string
    icon_logo_url: string | null // Assuming icon_logo_url can be a URL or null
    region: any // You might want to specify the type if available
    subRegion: any // You might want to specify the type if available
    namespace: string
    eventsData: any // You might want to specify the type if available
    isMythicPlusTeam: boolean
    path: string
  }
  members: TeamMember[]
  owner: Owner
  streamers: {
    count: number
    stream: any // You might want to specify the type if available
  }
  recruitmentProfiles: any[] // You might want to specify the type if available
}
