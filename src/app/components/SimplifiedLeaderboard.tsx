'use client'
import React, { useEffect } from 'react'
import { LeaderboardData, getTyrannicalLeaderboardData } from '../api/leaderboard/tyrannical'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MythicPlusTeam, getAllTeams } from '../api/getAllTeams'
import { getFortifiedLeaderboardData } from '../api/leaderboard/fortified'
import { calculatePoints, combineScore } from './leaderboard/helpers'
import Image from 'next/image'
import { urlForImage } from '../../../sanity/lib/image'
function SimplifiedLeaderboard() {
  const [tyrannical, setTyrannicalData] = React.useState<LeaderboardData>([])
  const [fortified, setFortifiedData] = React.useState<LeaderboardData>([])
  const [allTeams, setAllTeams] = React.useState<MythicPlusTeam[]>([])

  useEffect(() => {
    async function fetchData() {
      const tyrannical = await getTyrannicalLeaderboardData()
      const fortified = await getFortifiedLeaderboardData()
      const allTeams = await getAllTeams()

      setTyrannicalData(tyrannical)
      setFortifiedData(fortified)
      setAllTeams(allTeams)
    }
    fetchData()
  }, [])

  const tyrannicalPoints = calculatePoints({ leaderboardData: tyrannical, allTeams })
  const fortifiedPoints = calculatePoints({ leaderboardData: fortified, allTeams })
  let combinedPoints = combineScore(tyrannicalPoints, fortifiedPoints)

  const sortCombinedPoints = combinedPoints.sort((a, b) => {
    return b.totalScore - a.totalScore
  })

  return (
    combinedPoints &&
    combinedPoints.length > 0 && (
      <div className=" p-4 mt-4">
        <div className="flex gap-4 pb-2 justify-end w-full flex-col lg:flex-row md:flex-row"></div>

        <Table className="max-w-screen-xlg">
          <TableHeader className=" bg-[#028AFD]  ">
            <TableRow className="border-[1px] border-black ">
              <TableHead className="text-white font-extrabold rounded-tl-xl ">Plass</TableHead>
              <TableHead className="text-white font-extrabold min-w-48 ">Lag</TableHead>
              <TableHead className="text-white font-extrabold text-center rounded-tr-xl">Poeng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortCombinedPoints.map((team, index) => {
              const teamImage = allTeams.find((e) => e._id === team._ref)?.teamImage?.asset._ref
              return (
                <TableRow key={index} className="  bg-[#052D49] even:bg-[#0B436C] border-none text-white ">
                  <TableCell className="font-bold text-white text-lg text-center border-r-[1px]     border-black">
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
                  <TableCell className="font-bold text-[#FCD20A] text-lg text-center border-r-[1px]  border-black  ">
                    {Number((combinedPoints?.find((e) => e._ref === team._ref)?.totalScore || 0).toFixed(1))}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  )
}

export default SimplifiedLeaderboard
