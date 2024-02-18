'use client'
import TeamCard from './components/TeamCard'

import { getAllTeams } from './api/getAllTeams'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const Home = () => {
  const [allTeams, setAllTeams] = useState<MythicPlusTeam[]>([])
  useEffect(() => {
    const fetchData = async () => {
      const teams = (await getAllTeams()) as MythicPlusTeam[]
      setAllTeams(teams)
    }
    fetchData()
  }, [])

  return (
    <main className="flex flex-col max-w-7xl m-auto ">
      <h1 className="text-center mt-20 text-6xl font-semibold">LAGENE</h1>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mt-10 p-2 min-w-full ">
        {allTeams.map((team) => (
          <Link href={`/team/${team.teamSlug}`} key={team._id}>
            <TeamCard key={team._id} team={team} />
          </Link>
        ))}
      </div>
    </main>
  )
}

export default Home

type ImageAsset = {
  _type: string
  asset: {
    _ref: string
    _type: string
  }
}

type Player = {
  realmName: string
  _type: string
  characterName: string
  _key: string
}

export type MythicPlusTeam = {
  _updatedAt: string
  teamName: string
  teamSlug: string
  teamImage: ImageAsset
  players: Player[]
  _createdAt: string
  _rev: string
  _type: string
  _id: string
}
