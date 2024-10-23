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




interface ResultsTableProps
{
  matchResults: MatchResult[]
  sanityTeamData: MythicPlusTeam[]
}

const ResultsTable: React.FC<ResultsTableProps> = ({ matchResults, sanityTeamData }) =>
{


  // Calculate team stats based on match results
  const calculateTeamStats = (results: MatchResult[]): TeamStats[] =>
  {
    const teamStatsMap: Record<string, TeamStats> = {}

    // Preprocess sanityTeamData for faster lookup
    const teamDataMap: Record<string, MythicPlusTeam> = {}
    sanityTeamData.forEach(team =>
    {
      teamDataMap[ team.teamSlug ] = team
    })

    results.forEach((result) =>
    {
      const teamSlug = result.team_slug

      // Initialize team stats if not present
      if (!teamStatsMap[ teamSlug ]) {
        const teamData = teamDataMap[ teamSlug ]
        teamStatsMap[ teamSlug ] = {
          team_slug: teamSlug,
          team_name: teamData?.teamName ?? '',
          wins: 0,
          losses: 0,
          points: 0,
          image: teamData?.teamImage.asset._ref ?? '',
        }
      }

      const teamStats = teamStatsMap[ teamSlug ]

      // Calculate the number of matches won by the team
      const matchesWon = [ result.match_1, result.match_2, result.match_3 ]
        .filter((match) => match === 1).length

      // Determine if match_3 was played
      const match3Played = result.match_3 === 0 || result.match_3 === 1

      if (matchesWon >= 2) {
        // Team wins overall
        teamStats.points += 2
        teamStats.wins += 1
      } else if (match3Played) {
        // Team loses overall but match_3 was played
        teamStats.points += 1
        teamStats.losses += 1
      } else {
        // Team loses overall and match_3 was not played
        teamStats.points += 0
        teamStats.losses += 1
      }
    })

    return Object.values(teamStatsMap)
  }

  const teamStats = calculateTeamStats(matchResults)

  const sortedTeamStats = [ ...teamStats ].sort((a, b) => b.points - a.points);


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
          {sortedTeamStats.map((team, index) => (
            <TableRow key={index} className="bg-[#052D49] even:bg-[#0B436C] border-none text-white">
              <TableCell className="min-w-32 text-white font-bold flex items-center border-r-[1px] border-black">
                <Image
                  src={urlForImage(team.image)}
                  alt={`${team.team_name} logo`}
                  width={45}
                  height={45}
                  className="mr-3 w-8 h-8 rounded-full"
                />
                <span className="text-sm font-bold">{team.team_name}</span>
              </TableCell>
              <TableCell className="font-bold text-[#FCD20A] text-lg text-center border-r-[1px] border-black">
                {team.wins}
              </TableCell>
              <TableCell className="font-bold text-[#FCD20A] text-lg text-center border-r-[1px] border-black">
                {team.losses}
              </TableCell>
              <TableCell className="font-bold text-[#FCD20A] text-lg text-center">{team.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ResultsTable



