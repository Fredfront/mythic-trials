// src/types.ts
export type SupabaseTeamType = {
  id: string
  name: string
  contact_person: string
  team_slug: string
  approved_in_sanity: boolean
}

export type SupabaseTeamsType = {
  teams: SupabaseTeamType[]
}

type roundDates = {
  round_date: string
  round: number
}

export type Team = {
  id: string
  name: string
  contact_person: string
  team_slug: string
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
}

export type MatchWithTeams = {
  match_uuid: string
  round: number
  round_date: string
  round_startTime: string
  featured: boolean
  home_team: Team
  away_team: Team
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
}

export type Match = {
  teams: [TeamMatch, TeamMatch]
  featured: boolean
}

export type Round = Match[]

export type TournamentSchedule = Round[]
