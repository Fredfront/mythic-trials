import { Round, SupabaseTeamType, TournamentSchedule } from '../../../../../types'

var robin = require('roundrobin')

type roundDates = { round: number; round_date: string }

export function useGenerateRoundRobin(roundDates: roundDates[], teams: SupabaseTeamType[], email: string | undefined) {
  function generateRoundRobin(teams: SupabaseTeamType[]) {
    // Extract team details in a way that retains contact person info
    const teamDetails = teams.map((team) => ({
      name: team.name,
      contactPerson: team.contact_person,
      team_slug: team.team_slug,
      id: team.id,
    }))

    // Generate the round robin tournament
    const teamNames = teamDetails.map((team) => team.name)
    const roundRobinRounds = robin(teams.length, teamNames)

    // Replace team names with objects containing the name and contact person
    const detailedRoundRobinRounds: TournamentSchedule = roundRobinRounds.map((round: any, roundIndex: number) => {
      const detailedRound: Round = round.map((match: string[]) => {
        const teamSlug = teamDetails.find((team) => team.name === match[0])?.team_slug
        return {
          teams: match.map((teamName: string, teamIndex: number) => {
            const teamDetail = teamDetails.find((team) => team.name === teamName)
            return {
              name: teamName,
              contactPerson: email === teamDetail?.contactPerson ? teamDetail?.contactPerson : undefined,
              team_slug: teamDetail?.team_slug,
              round: roundIndex + 1,
              roundDate: roundDates.find((e) => e.round === roundIndex + 1)?.round_date,
              home: teamIndex === 0,
              matchUUID: `${teamSlug}-${teamDetails.find((team) => team.name === match[1])?.team_slug}-round-${roundIndex + 1}-roundDate-${roundDates.find((e) => e.round === roundIndex + 1)?.round_date}`,
            }
          }),
        }
      })

      return detailedRound
    })

    return detailedRoundRobinRounds
  }

  const detailedSchedule = generateRoundRobin(teams) as TournamentSchedule

  return {
    detailedSchedule,
    generateRoundRobin,
  }
}
