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
    <div className="p-4 flex items-center rounded-md bg-[#021F33] text-white  hover:bg-slate-500 cursor-pointer max-w-full md:max-w-80  w-screen md:min-w-72 ">
      <Image
        src={urlForImage(team.teamImage.asset._ref as any)}
        alt={team.teamName}
        className="rounded-full mr-4  h-24 w-24 aspect-auto "
        width={100}
        height={100}
      />
      <div className="text-xl font-extrabold text-white">{team.teamName}</div>
    </div>
  )
}

export default TeamCard
