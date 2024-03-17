'use client'
import React, { useEffect } from 'react'
import { LeaderboardData, getTyrannicalLeaderboardData } from '../api/leaderboard/tyrannical'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MythicPlusTeam, getAllTeams } from '../api/getAllTeams'
import { getFortifiedLeaderboardData } from '../api/leaderboard/fortified'
import { calculatePoints, combineScore, shortenDungeonName } from './leaderboard/helpers'
import { projectId, dataset, apiVersion, useCdn, token } from '../../../sanity/env'
import { createClient } from '@sanity/client'
import Image from 'next/image'
import { urlForImage } from '../../../sanity/lib/image'
function SimplifiedLeaderboard() {
  const [tyrannical, setTyrannicalData] = React.useState<LeaderboardData>([])
  const [fortified, setFortifiedData] = React.useState<LeaderboardData>([])
  const [combinedTyranAndFort, setCombinedTyranAndFort] = React.useState<LeaderboardData>([])
  const [allTeams, setAllTeams] = React.useState<MythicPlusTeam[]>([])
  const USE_LISTENERS: boolean = false
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
  })

  React.useEffect(() => {
    async function fetchData() {
      const tyrannical = await getTyrannicalLeaderboardData()
      const fortified = await getFortifiedLeaderboardData()
      const allTeams = await getAllTeams()

      setTyrannicalData(tyrannical)

      setFortifiedData(fortified)
      //sort tyrannical from a-z

      setAllTeams(allTeams)
    }
    fetchData()
  }, [])

  useEffect(() => {
    tyrannical.sort((a, b) => {
      if (a.dungeon < b.dungeon) {
        return -1
      }
      if (a.dungeon > b.dungeon) {
        return 1
      }
      return 0
    })

    //sort fortified from a-z
    fortified.sort((a, b) => {
      if (a.dungeon < b.dungeon) {
        return -1
      }
      if (a.dungeon > b.dungeon) {
        return 1
      }
      return 0
    })

    const tyrannicalWithTyranFlag = tyrannical.map((e) => {
      return { ...e, isTyrannical: true }
    })

    const fortifiedWithFortFlag = fortified.map((e) => {
      return { ...e, isFortified: true }
    })

    const concatted = [...tyrannicalWithTyranFlag, ...fortifiedWithFortFlag]

    //sort concatted from a-z
    concatted.sort((a, b) => {
      if (a.dungeon < b.dungeon) {
        return -1
      }
      if (a.dungeon > b.dungeon) {
        return 1
      }
      return 0
    })

    setCombinedTyranAndFort(concatted)
  }, [fortified, tyrannical])

  useEffect(() => {
    if (USE_LISTENERS === false) return

    const tyrannicalQuery = `*[_type == "tyrannicalLeaderboard"] {
      dungeon,
      baseTimer,
      teams
    }`

    const fortfiedQuery = `*[_type == "fortifiedLeaderboard"] {
      dungeon,
      baseTimer,
      teams
    }`

    const tyrannicalSubscription = client.listen(tyrannicalQuery).subscribe((update: any) => {
      const findDungeonToUpdate = tyrannical.find((e) => e.dungeon === update.result.dungeon)

      if (findDungeonToUpdate) {
        const index = tyrannical.indexOf(findDungeonToUpdate)
        tyrannical[index] = update.result
        setTyrannicalData([...tyrannical])
      } else {
        setTyrannicalData([...tyrannical, update.result])
      }
    })

    const fortifiedSubscription = client.listen(fortfiedQuery).subscribe((update: any) => {
      const findDungeonToUpdate = fortified.find((e) => e.dungeon === update.result.dungeon)

      if (findDungeonToUpdate) {
        const index = fortified.indexOf(findDungeonToUpdate)
        fortified[index] = update.result
        setFortifiedData([...fortified])
      } else {
        setFortifiedData([...fortified, update.result])
      }
    })

    return () => {
      tyrannicalSubscription.unsubscribe()
      fortifiedSubscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client])

  const tyrannicalPoints = calculatePoints({ leaderboardData: tyrannical, allTeams })
  const fortifiedPoints = calculatePoints({ leaderboardData: fortified, allTeams })
  let combinedPoints = combineScore(tyrannicalPoints, fortifiedPoints)

  return (
    <div className=" p-4 mt-4">
      <div className="flex gap-4 pb-2 justify-end w-full flex-col lg:flex-row md:flex-row"></div>

      <Table className="max-w-screen-xlg">
        <TableHeader className=" bg-[#028AFD]  ">
          <TableRow className="border-[1px] border-black ">
            <TableHead className="text-white font-extrabold rounded-tl-xl ">Plass</TableHead>
            <TableHead className="text-white font-extrabold min-w-48">Lag</TableHead>
            <TableHead className="text-white font-extrabold text-center rounded-tr-xl">Poeng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinedPoints.map((team, index) => {
            const teamImage = allTeams.find((e) => e._id === team._ref)?.teamImage?.asset._ref
            return (
              <TableRow key={index} className="  bg-[#052D49] even:bg-[#0B436C] border-none text-white">
                <TableCell className="font-bold text-white text-lg text-center border-r-[1px]  border-black rounded-bl-xl">
                  {index + 1}.
                </TableCell>

                <TableCell className=" min-w-32 text-white font-bold flex items-center border-r-[1px]  border-black">
                  <Image
                    src={urlForImage(teamImage ?? '')}
                    alt={`${team.teamName} logo`}
                    width={45}
                    height={45}
                    className="mr-3 w-8 h-8 rounded-full"
                  />
                  <span className=" text-sm font-bold">{team.teamName}</span>
                </TableCell>
                <TableCell className="font-bold text-[#FCD20A] text-lg text-center border-r-[1px] border-b-[1px] border-black rounded-br-xl">
                  {Number((combinedPoints?.find((e) => e._ref === team._ref)?.totalScore || 0).toFixed(1))}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default SimplifiedLeaderboard
