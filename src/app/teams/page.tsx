import React from 'react'
import { getAllTeams } from '../api/getAllTeams'
import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '../../../sanity/lib/image'

async function Teams() {
  const allTeams = await getAllTeams()
  return (
    <div className="flex gap-4 md:gap-10 mt-20  max-w-9xl p-4 flex-wrap ">
      {allTeams.map((team) => (
        <Link prefetch={true} href={`/team/${team.teamSlug}`} key={team._id} className="w-full md:w-72">
          <div
            key={team._key}
            className="p-4 flex rounded-md bg-[#021F33] text-white  hover:bg-slate-500 cursor-pointer items-center "
          >
            <Image
              src={urlForImage(team.teamImage.asset._ref as any)}
              alt={team.teamName}
              className="rounded-full mr-4  h-24 w-24 "
              width={300}
              height={300}
            />
            <div className="text-xl font-extrabold text-white">{team.teamName}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default Teams
