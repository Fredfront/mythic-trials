// src/types.ts
export type SupabaseTeamType = {
  id: string
  name: string
  contact_person: string
  team_slug: string
  approved_in_sanity: boolean
  discord_username: string
}

export type SupabaseTeamsType = {
  teams: SupabaseTeamType[]
}

export type MatchRecord = {
  id: string
  match_uuid: string
  round: number
  round_date: string
  home_team_id: string
  away_team_id: string
  rescheduled: boolean
  round_startTime: string
  rescheduled_round_date: string | null
  rescheduled_round_startTime: string | null
  home_team_proposed_rescheduled_round_date: string | null
  home_team_proposed_rescheduled_round_startTime: string | null
  away_team_proposed_rescheduled_round_date: string | null
  away_team_proposed_rescheduled_round_startTime: string | null
  proposed_rescheduled_round_startTime: string | null
  featured: boolean
  home_team_agree_reschedule: boolean
  away_team_agree_reschedule: boolean
  bo2: boolean
  bo3: boolean
  tournament_name: string
  stage: 'group' | 'playoff'
  playoff_round: 'final' | 'semifinal' | 'quarterfinal' | 'round of 16' | 'bronze_final'
}

export type MatchWithTeams = {
  match_uuid: string
  round: number
  round_date: string
  round_startTime: string
  featured: boolean
  home_team: SupabaseTeamType
  away_team: SupabaseTeamType
}

export type TeamMatch = {
  name: string
  contactPerson: string
  team_slug: string
  round: number
  home: boolean
  roundDate: string
  matchUUID: string
  round_startTime?: string
  rescheduled: boolean
  rescheduled_round_date: string | null
  rescheduled_round_startTime: string | null
  home_team_proposed_rescheduled_round_date: string | null
  home_team_proposed_rescheduled_round_startTime: string | null
  away_team_proposed_rescheduled_round_date: string | null
  away_team_proposed_rescheduled_round_startTime: string | null
  home_team_agree_reschedule: boolean
  away_team_agree_reschedule: boolean
  id: string
  bo3: boolean
  bo2: boolean
  tournament_name: string
  stage?: 'group' | 'playoff'
  playoff_round?: 'final' | 'semifinal' | 'quarterfinal' | 'round of 16' | 'bronze_final'
}

export type Match = {
  teams: [TeamMatch, TeamMatch]
  featured: boolean
  bo2: boolean
  bo3: boolean
  tournament_name: string
  stage: 'group' | 'playoff'
  playoff_round?: 'final' | 'semifinal' | 'quarterfinal' | 'round of 16' | 'bronze_final'
}

export type Round = Match[]

export type TournamentSchedule = Round[]

export type matchDataType = Match & { myTeam: string } & { opponent: string }

export type MatchResult = {
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
  draw: boolean
  bo2: boolean
  bo3: boolean
}
