import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { LeaderboardData, TeamEntry } from '@/app/api/leaderboard/tyrannical'

export type teamPointsType = {
  teamName: string
  teamSlug: string
  _ref: string
  totalScore: number
}

// Calculate points for each team
export const calculatePoints = ({
  leaderboardData,
  allTeams,
}: {
  leaderboardData: LeaderboardData
  allTeams: MythicPlusTeam[]
}) => {
  const timeToSeconds = (time: string) => {
    const [minutes, seconds] = time.split(':').map(Number)
    return minutes * 60 + seconds
  }

  const pointsData: { [key: string]: teamPointsType } = {}

  leaderboardData?.forEach(({ baseTimer, teams }: { teams: TeamEntry[]; baseTimer: string }) => {
    const baseTimerSeconds = baseTimer ? timeToSeconds(baseTimer) : 0

    teams.forEach(
      ({ minutes, seconds, team }: { team: { _key: string; _ref: string }; minutes: number; seconds: number }) => {
        const teamTimeSeconds = minutes * 60 + seconds
        const timeDifference = baseTimerSeconds - teamTimeSeconds

        // Calculate points per second under the base timer (0.1 point per second)
        const points = Math.max(0, timeDifference) * 0.01

        const teamKey = team._ref
        if (!pointsData[teamKey]) {
          pointsData[teamKey] = {
            teamName: allTeams?.find((e) => e._id === teamKey)?.teamName as string,
            teamSlug: allTeams?.find((e) => e._id === teamKey)?.teamSlug as string,
            _ref: teamKey,
            totalScore: 0,
          }
        }
        pointsData[teamKey].totalScore += points
      },
    )
  })

  const pointsArray = Object.values(pointsData) as teamPointsType[]

  return pointsArray.sort((a, b) => {
    return b.totalScore - a.totalScore
  })
}

export function shortenDungeonName(name: string) {
  let dungeonName = name

  if (name === 'Darkheart Thicket') return 'DHT'
  if (name === 'Everbloom') return 'EB'
  if (name === 'Throne of the Tides') return 'TOT'
  if (name === 'Black Rook Hold') return 'BRH'
  if (name.includes('Atal')) return 'AD'
  if (name.includes('Murozond')) return 'Rise'
  if (name.includes('Galakrond')) return 'Fall'
  if (name.includes('Waycres')) return 'WM'

  return dungeonName
}
export function combineScore(tyrannicalPoints: teamPointsType[], fortifiedPoints: teamPointsType[]) {
  const combinedTeams = [...tyrannicalPoints, ...fortifiedPoints]
  const teamScores = {} as any
  combinedTeams.forEach((team) => {
    if (team.teamName in teamScores) {
      teamScores[team.teamName].totalScore += team.totalScore
    } else {
      teamScores[team.teamName] = {
        teamName: team.teamName,
        teamSlug: team.teamSlug,
        _ref: team._ref,
        totalScore: team.totalScore,
      }
    }
  })
  const combinedPoints = Object.values(teamScores) as teamPointsType[]
  return combinedPoints
}
