/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { urlForImage } from '../../../sanity/lib/image'
import Image from 'next/image'
import { MythicPlusTeam } from '../api/getAllTeams'

type TeamCardProps = {
  team: MythicPlusTeam
}

const TeamCard: React.FC<TeamCardProps> = ({ team }: TeamCardProps) => {
  return (
    <div className=" rounded-lg p-4 flex items-center bg-[#1e2225] text-white w-full min-w-full hover:bg-slate-500 cursor-pointer">
      <Image
        src={urlForImage(team.teamImage.asset._ref as any)}
        alt={team.teamName}
        className="rounded-full mr-4 ml-1 w-28 h-28"
        width={120}
        height={120}
        style={{ border: '6px solid #2e2c37' }}
      />
      <div className="text-2xl font-extrabold">{team.teamName}</div>
    </div>
  )
}

export default TeamCard
