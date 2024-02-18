/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { MythicPlusTeam } from '../page'
import { urlForImage } from '../../../sanity/lib/image'

type TeamCardProps = {
  team: MythicPlusTeam
}

const TeamCard: React.FC<TeamCardProps> = ({ team }: TeamCardProps) => {
  return (
    <div className="p-4 flex items-center bg-[#1e2225]  w-full min-w-full hover:bg-slate-500 cursor-pointer">
      <img
        style={{ borderRadius: '50%', width: '120px', height: '120px', marginLeft: '1rem', marginRight: '1rem' }}
        src={urlForImage(team.teamImage.asset._ref as any)}
        alt={team.teamName}
      />

      <div className="text-3xl font-medium">{team.teamName}</div>
    </div>
  )
}

export default TeamCard
