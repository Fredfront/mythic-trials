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
  home: boolean
  roundDate: string
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

export type Match = {
  teams: [ TeamMatch, TeamMatch ]
  featured: boolean
}
type Round = Match[]

type TournamentSchedule = Round[]

export function useGenerateRoundRobin(teams: SupabaseTeamType[], email: string | undefined)
{
  function generateRoundRobinWithContacts(teams: SupabaseTeamType[])
  {
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

    // Initialize a Set to keep track of featured teams
    const featuredTeams = new Set<string>()

    // Replace team names with objects containing the name and contact person
    const detailedRoundRobinRounds: TournamentSchedule = roundRobinRounds.map((round: any, roundIndex: number) =>
    {
      const detailedRound: Round = round.map((match: string[]) =>
      {
        return {
          teams: match.map((teamName: string, teamIndex: number) =>
          {
            const teamDetail = teamDetails.find((team) => team.name === teamName)
            return {
              name: teamName,
              contactPerson: email === teamDetail?.contactPerson ? teamDetail?.contactPerson : undefined,
              team_slug: teamDetail?.team_slug,
              round: roundIndex + 1,
              roundDate: roundDates[ roundIndex ],
              home: teamIndex === 0,
            }
          }) as unknown as [ TeamMatch, TeamMatch ],
          featured: false, // Initialize as not featured
        }
      })

      // Select a featured match for the current round
      for (let match of detailedRound) {
        const [ team1, team2 ] = match.teams
        if (!featuredTeams.has(team1.team_slug) && !featuredTeams.has(team2.team_slug)) {
          match.featured = true
          featuredTeams.add(team1.team_slug)
          featuredTeams.add(team2.team_slug)
          break // Only one match per round
        }
      }

      return detailedRound
    })

    return detailedRoundRobinRounds
  }

  const detailedSchedule = generateRoundRobinWithContacts(teams) as TournamentSchedule

  return {
    detailedSchedule,
  }
}