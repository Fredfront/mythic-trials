'use client'
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Image from 'next/image'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { urlForImage } from '../../../../../sanity/lib/image'

type MatchResult = {
  id: number
  match_1: number
  match_2: number
  match_3: number | null
  opponent: string
  round: number
  team_slug: string
  confirm: boolean
  contact_person: string
  winner: boolean
  matchUUID: string
}

type TeamStats = {
  team_slug: string
  team_name: string
  wins: number
  losses: number
  points: number
  image: string
}

interface ResultsTableProps {
  matchResults: MatchResult[]
  sanityTeamData: MythicPlusTeam[]
}

const ResultsTable: React.FC<ResultsTableProps> = ({ matchResults, sanityTeamData }) => {
  // Calculate team stats
  const calculateTeamStats = (results: MatchResult[]): TeamStats[] => {
    const teamStatsMap: Record<string, TeamStats> = {}

    results.forEach((result) => {
      if (!teamStatsMap[result.team_slug]) {
        teamStatsMap[result.team_slug] = {
          team_slug: result.team_slug,
          team_name: sanityTeamData.find((team) => team.teamSlug === result.team_slug)?.teamName ?? '',
          wins: 0,
          losses: 0,
          points: 0,
          image: sanityTeamData.find((team) => team.teamSlug === result.team_slug)?.teamImage.asset._ref ?? '',
        }
      }

      const teamStats = teamStatsMap[result.team_slug]
      let points = 0
      if (result.match_1 === 1 && result.match_2 === 1) {
        points = 2 // Win both matches
      } else if (
        (result.match_1 === 1 && result.match_2 === 0 && result.match_3 === 1) ||
        (result.match_1 === 0 && result.match_2 === 1 && result.match_3 === 1)
      ) {
        points = 1 // Win one and win tie-breaker
      }

      if (result.winner) {
        teamStats.wins += 1
      } else {
        teamStats.losses += 1
      }

      teamStats.points += points
    })

    return Object.values(teamStatsMap)
  }

  const teamStats = calculateTeamStats(matchResults)

  return (
    <div className="p-4 mt-4">
      <Table className="max-w-screen-xlg rounded-2xl overflow-hidden">
        <TableHeader className="bg-[#028AFD] rounded-t-lg">
          <TableRow className="border-[1px] border-black">
            <TableHead className="text-white font-extrabold min-w-48">Team</TableHead>
            <TableHead className="text-white font-extrabold text-center">Wins</TableHead>
            <TableHead className="text-white font-extrabold text-center">Losses</TableHead>
            <TableHead className="text-white font-extrabold text-center">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rounded-b-lg">
          {teamStats.map((team, index) => {
            return (
              <TableRow key={index} className="bg-[#052D49] even:bg-[#0B436C] border-none text-white">
                <TableCell className="min-w-32 text-white font-bold flex items-center border-r-[1px] border-black">
                  <Image
                    src={urlForImage(team.image)}
                    alt={`${team.team_name} logo`}
                    width={45}
                    height={45}
                    className="mr-3 w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-bold"> {team.team_name}</span>
                </TableCell>
                <TableCell className="font-bold text-[#FCD20A] text-lg text-center border-r-[1px] border-black">
                  {team.wins}
                </TableCell>
                <TableCell className="font-bold text-[#FCD20A] text-lg text-center border-r-[1px] border-black">
                  {team.losses}
                </TableCell>
                <TableCell className="font-bold text-[#FCD20A] text-lg text-center">{team.points}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default ResultsTable
