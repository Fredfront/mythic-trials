var robin = require('roundrobin')

export type SupabaseTeamType = {
  id: number
  name: string
  contact_person: string
  team_slug: string
  points: number
}

export type SupabaseTeamsType = {
  teams: SupabaseTeamType[]
}

type TeamMatch = {
  name: string
  contactPerson: string
  team_slug: string
  round: number
}

const roundDates = [
  '2024-11-15',
  //1 week later
  '2024-11-22',
  //2 weeks later
  '2024-11-29',
  //3 weeks later
  '2024-12-06',
  //4 weeks later
  '2024-12-13',
  //5 weeks later
  '2024-12-20',
  //Break til new year
  '2025-01-03',
  //1 week later
  '2025-01-10',
]

type Match = [TeamMatch, TeamMatch]

type Round = Match[]

type TournamentSchedule = Round[]

export function useGenerateRoundRobin(teams: SupabaseTeamType[], email: string | undefined) {
  function generateRoundRobinWithContacts(teams: SupabaseTeamType[]) {
    // Extract team details in a way that retains contact person info
    const teamDetails = teams?.map((team) => ({
      name: team.name,
      contactPerson: team.contact_person,
      team_slug: team.team_slug,
      id: team.id,
    }))

    // Generate the round robin tournament
    const teamNames = teamDetails.map((team: any) => team.name)
    const roundRobinRounds = robin(teams.length, teamNames)

    // Replace team names with objects containing the name and contact person
    const detailedRoundRobinRounds = roundRobinRounds.map((round: any) =>
      round.map((match: string[]) =>
        match.map((teamName: string) => {
          const teamDetail = teamDetails.find((team) => team.name === teamName)
          return {
            name: teamName,
            contactPerson: email === teamDetail?.contactPerson ? teamDetail?.contactPerson : undefined,
            team_slug: teamDetail?.team_slug,
            round: roundRobinRounds.indexOf(round) + 1,
            roundDate: roundDates[roundRobinRounds.indexOf(round)],
            home: match.indexOf(teamName) === 0,
          }
        }),
      ),
    )

    return detailedRoundRobinRounds
  }

  const detailedSchedule = generateRoundRobinWithContacts(teams) as TournamentSchedule

  return {
    detailedSchedule,
  }
}
