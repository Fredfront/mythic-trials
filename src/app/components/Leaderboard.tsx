'use client'
import React, { Suspense, useEffect } from 'react'
import { LeaderboardData, getTyrannicalLeaderboardData } from '../api/leaderboard/tyrannical'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MythicPlusTeam, getAllTeams } from '../api/getAllTeams'
import { getFortifiedLeaderboardData } from '../api/leaderboard/fortified'
import { calculatePoints, combineScore, shortenDungeonName } from './leaderboard/helpers'
import { Checkbox } from '@/components/ui/checkbox'
import { projectId, dataset, apiVersion, useCdn, token } from '../../../sanity/env'
import { createClient } from '@sanity/client'
import Image from 'next/image'
import { urlForImage } from '../../../sanity/lib/image'
function LeaderboardComponent() {
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
            placeholder="Søk..."
            name="filterTeam"
            id="filterTeam"
            className="rounded-lg p-1 pl-2 mr-2 bg-[#011624] border-2 border-[#028AFD] focus:outline-none focus:border-[#028AFD] text-white"
            onChange={(e) => setSearchTeam(e.target.value)}
          />{' '}
        </div>
      </div>

      <Table className="max-w-screen-xlg  ">
        <TableHeader className=" bg-[#028AFD] ">
          <TableRow className="border-[1px] border-black ">
            <TableHead className="text-white font-extrabold min-w-48">Lag</TableHead>
            <TableHead className="text-white font-extrabold text-center">Poeng</TableHead>

            {combinedTyranAndFort.map((leader, index) => {
              if (hideTyrannical && leader.isTyrannical === true) return null
              if (hideFortified && leader.isFortified) return null
              return (
                <TableHead className="text-white font-bold min-w-24 text-center" key={index}>
                  {shortenDungeonName(leader.dungeon)} {leader.isTyrannical ? '(Tyr)' : '(For)'}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinedPoints.map((team, index) => {
            const teamImage = allTeams.find((e) => e._id === team._ref)?.teamImage?.asset._ref
            return (
              <TableRow key={index} className="  bg-[#052D49] even:bg-[#0B436C] border-none text-white">
                <TableCell className=" min-w-32 text-white font-bold flex items-center border-r-[1px] border-b-[1px] border-black">
                  <Image
                    src={urlForImage(teamImage ?? '')}
                    alt={`${team.teamName} logo`}
                    width={45}
                    height={45}
                    className="mr-3 w-8 h-8 rounded-full"
                  />
                  <span className=" text-sm font-bold">{team.teamName}</span>
                </TableCell>
                <TableCell className="font-bold text-[#FCD20A] text-lg text-center border-r-[1px] border-b-[1px] border-black">
                  {Number((combinedPoints?.find((e) => e._ref === team._ref)?.totalScore || 0).toFixed(1))}
                </TableCell>
                {combinedTyranAndFort?.map((lead, leadIndex) => {
                  if (hideTyrannical && lead.isTyrannical === true) return null
                  if (hideFortified && lead.isFortified) return null
                  let seconds = lead.teams?.find((a) => a.team._ref === team._ref)?.seconds as string | number

                  if (seconds && (seconds as number) < 10) {
                    seconds = `0${seconds}`
                  }

                  const timeString = `${lead?.teams?.find((a) => a.team._ref === team._ref)?.minutes}:${seconds}`
                  const hasTime =
                    lead.teams?.find((a) => a.team._ref === team._ref)?.minutes !== undefined &&
                    lead.teams?.find((a) => a.team._ref === team._ref)?.seconds !== undefined
                      ? true
                      : false
                  return (
                    <TableCell className="text-white text-center  border-b-[1px] border-black" key={leadIndex}>
                      {hasTime ? (
                        <span className="border 2px border-[#028AFD] pr-4 pl-4 pt-1 pb-1 rounded-sm  ">
                          {timeString}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default LeaderboardComponent
