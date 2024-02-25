import React from 'react'
import { getTyrannicalLeaderboardData } from '../api/leaderboard/tyrannical'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getAllTeams } from '../api/getAllTeams'
import { getFortifiedLeaderboardData } from '../api/leaderboard/fortified'
import { calculatePoints, combineScore, shortenDungeonName } from './leaderboard/helpers'
async function LeaderboardComponent() {
  const tyrannical = await getTyrannicalLeaderboardData()
  const fortified = await getFortifiedLeaderboardData()
  const allTeams = await getAllTeams()
  const tyrannicalPoints = calculatePoints({ leaderboardData: tyrannical, allTeams })
  const fortifiedPoints = calculatePoints({ leaderboardData: fortified, allTeams })
  const combinedPoints = combineScore(tyrannicalPoints, fortifiedPoints)

  return (
    <Table className=" max-w-screen-xlg  ">
      <TableHeader className="bg-orange-400 ">
        <TableRow>
          <TableHead className="text-black font-extrabold">Lagnavn</TableHead>
          {tyrannical.map((leader, index) => (
            <TableHead className="text-black  font-extrabold min-w-24" key={index}>
              {shortenDungeonName(leader.dungeon)} (T)
            </TableHead>
          ))}
          {fortified.map((leader, index) => (
            <TableHead className="text-black font-extrabold min-w-24" key={index}>
              {shortenDungeonName(leader.dungeon)} (F)
            </TableHead>
          ))}
          <TableHead className="text-black  font-extrabold">Poeng</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {combinedPoints.map((team, index) => {
          return (
            <TableRow key={index} className=" bg-gray-950 even:bg-gray-900">
              <TableCell className=" min-w-32">{team.teamName}</TableCell>
              {tyrannical.map((lead, leadIndex) => {
                const timeString = `${lead.teams.find((a) => a.team._ref === team._ref)?.minutes}:${lead.teams.find((a) => a.team._ref === team._ref)?.seconds}`
                const hasTime =
                  lead.teams.find((a) => a.team._ref === team._ref)?.minutes !== undefined &&
                  lead.teams.find((a) => a.team._ref === team._ref)?.seconds !== undefined
                    ? true
                    : false
                return <TableCell key={leadIndex}>{hasTime ? timeString : '-'}</TableCell>
              })}
              {fortified.map((lead, leadIndex) => {
                const timeString = `${lead.teams.find((a) => a.team._ref === team._ref)?.minutes}:${lead.teams.find((a) => a.team._ref === team._ref)?.seconds}`
                const hasTime =
                  lead.teams.find((a) => a.team._ref === team._ref)?.minutes !== undefined &&
                  lead.teams.find((a) => a.team._ref === team._ref)?.seconds !== undefined
                    ? true
                    : false
                return <TableCell key={leadIndex}>{hasTime ? timeString : '-'}</TableCell>
              })}
              <TableCell>
                {Number((combinedPoints?.find((e) => e._ref === team._ref)?.totalScore || 0).toFixed(1))}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default LeaderboardComponent
