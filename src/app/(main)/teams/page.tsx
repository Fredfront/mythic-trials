import React from 'react'
import { getAllTeams } from '../../api/getAllTeams'
import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '../../../../sanity/lib/image'

async function Teams() {
  const allTeams = await getAllTeams()

  if (allTeams && allTeams.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-4xl font-bold text-white">Fant ingen lag</h1>
      </div>
    )
  }
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 p-4 md:p-10 ">
      {allTeams.map((team) => (
        <Link prefetch={true} href={`/team/${team.teamSlug}`} key={team._id} className="w-full">
          <div
            key={team._key}
            className="p-4 flex rounded-md bg-[#021F33] text-white  hover:bg-slate-500 cursor-pointer items-center min-w-80 "
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
