'use client'
import React, { useEffect } from 'react'
import { LeaderboardData, getTyrannicalLeaderboardData } from '../api/leaderboard/tyrannical'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MythicPlusTeam, getAllTeams } from '../api/getAllTeams'
import { getFortifiedLeaderboardData } from '../api/leaderboard/fortified'
import { calculatePoints, combineScore, shortenDungeonName } from './leaderboard/helpers'
import { Checkbox } from '@/components/ui/checkbox'
import { projectId, dataset, apiVersion, useCdn, token } from '../../../sanity/env'
import { createClient } from '@sanity/client'

function LeaderboardComponent() {
  const [tyrannical, setTyrannicalData] = React.useState<LeaderboardData>([])
  const [fortified, setFortifiedData] = React.useState<LeaderboardData>([])
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
      setAllTeams(allTeams)
    }
    fetchData()
  }, [])

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

  const [searchTeam, setSearchTeam] = React.useState('')

  const tyrannicalPoints = calculatePoints({ leaderboardData: tyrannical, allTeams })
  const fortifiedPoints = calculatePoints({ leaderboardData: fortified, allTeams })
  let combinedPoints = combineScore(tyrannicalPoints, fortifiedPoints)

  const [hideTyrannical, setHideTyrannical] = React.useState(false)
  const [hideFortified, setHideFortified] = React.useState(false)
  const [showOnlyPoints, setShowOnlyPoints] = React.useState(false)

  useEffect(() => {
    if (showOnlyPoints) {
      setHideFortified(true)
      setHideTyrannical(true)
    }
  }, [showOnlyPoints])

  if (searchTeam && searchTeam.length > 0) {
    combinedPoints = combinedPoints.filter((team) => team.teamName.toLowerCase().includes(searchTeam.toLowerCase()))
  }

  return (
    <div className=" p-4 mt-4">
      <div className="flex gap-4 pb-2 justify-end w-full flex-col lg:flex-row md:flex-row">
        {showOnlyPoints ? null : (
          <div>
            <Checkbox checked={hideTyrannical} onClick={() => setHideTyrannical(!hideTyrannical)} />
            <label className="text-white ml-2">Skjul Tyrannical</label>
          </div>
        )}

        {showOnlyPoints ? null : (
          <div>
            <Checkbox checked={hideFortified} onClick={() => setHideFortified(!hideFortified)} />
            <label className="text-white ml-2">Skjul Fortified</label>
          </div>
        )}

        <div>
          <Checkbox
            checked={showOnlyPoints}
            onClick={() => {
              setShowOnlyPoints(!showOnlyPoints)
              setHideFortified(false)
              setHideTyrannical(false)
            }}
          />
          <label className="text-white ml-2">Vis kun poeng</label>
        </div>

        <div>
          {' '}
          <input
            placeholder="Søk etter lag"
            name="filterTeam"
            id="filterTeam"
            className="rounded-lg p-1 pl-2 mr-2"
            onChange={(e) => setSearchTeam(e.target.value)}
          />{' '}
        </div>
      </div>

      <Table className="max-w-screen-xlg">
        <TableHeader className=" bg-[#eebc09fd] ">
          <TableRow>
            <TableHead className="text-black font-extrabold">Lagnavn</TableHead>
            {hideTyrannical
              ? null
              : tyrannical.map((leader, index) => (
                  <TableHead className="text-black  font-extrabold min-w-24" key={index}>
                    {shortenDungeonName(leader.dungeon)} (T)
                  </TableHead>
                ))}
            {hideFortified
              ? null
              : fortified.map((leader, index) => (
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
              <TableRow key={index} className="  bg-[#1d3659] even:bg-[#355575] border-none text-white">
                <TableCell className=" min-w-32 text-white font-bold">{team.teamName}</TableCell>
                {hideTyrannical
                  ? null
                  : tyrannical.map((lead, leadIndex) => {
                      const timeString = `${lead.teams.find((a) => a.team._ref === team._ref)?.minutes}:${lead.teams.find((a) => a.team._ref === team._ref)?.seconds}`
                      const hasTime =
                        lead.teams.find((a) => a.team._ref === team._ref)?.minutes !== undefined &&
                        lead.teams.find((a) => a.team._ref === team._ref)?.seconds !== undefined
                          ? true
                          : false
                      return (
                        <TableCell className="text-white" key={leadIndex}>
                          {hasTime ? timeString : '-'}
                        </TableCell>
                      )
                    })}
                {hideFortified
                  ? null
                  : fortified.map((lead, leadIndex) => {
                      const timeString = `${lead.teams.find((a) => a.team._ref === team._ref)?.minutes}:${lead.teams.find((a) => a.team._ref === team._ref)?.seconds}`
                      const hasTime =
                        lead.teams.find((a) => a.team._ref === team._ref)?.minutes !== undefined &&
                        lead.teams.find((a) => a.team._ref === team._ref)?.seconds !== undefined
                          ? true
                          : false
                      return (
                        <TableCell className="text-white" key={leadIndex}>
                          {hasTime ? timeString : '-'}
                        </TableCell>
                      )
                    })}
                <TableCell className="font-bold">
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

export default LeaderboardComponent
