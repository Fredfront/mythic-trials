import supabase from '@/utils/supabase/client'

export type PickAndBansType = {
  bans: number[]
  completed: boolean
  contact_person: string
  my_turn: boolean
  opponent: string
  pick: number
  ready: boolean
  round: number
  team_slug: string
  home: boolean
  step: number
  id: number
}

export async function createPickBanRow(
  round: number,
  contact_person: string,
  team_slug: string,
  opponent: string,
  home: boolean,
  matchUUID: string,
) {
  await supabase.from('pick_ban').insert([
    {
      contact_person,
      round,
      team_slug,
      bans: null,
      completed: false,
      my_turn: home ? false : true,
      opponent,
      pick: null,
      ready: false,
      home,
      step: home ? 2 : 1,
      matchUUID,
    },
  ])
}

type Match_results = {
  round: number
  contact_person: string
  team_slug: string
  opponent: string
  match_1?: number | null
  match_2?: number | null
  match_3?: number | null
  confirm?: boolean
  winner?: boolean
  matchUUID: string
}

export async function create_match_results({ matchResults }: { matchResults: Match_results }) {
  await supabase.from('match_results').insert(matchResults)
}

export async function createPickBanRowIfNotExist({
  email,
  round,
  team_slug,
  opponent,
  home,
  matchUUID,
}: {
  email: string
  round: number
  team_slug: string
  opponent: string
  home: boolean
  matchUUID: string
}) {
  await supabase
    .from('pick_ban')
    .select('*')
    .eq('contact_person', email.trim())
    .eq('round', round)
    .then((res) => {
      if (res.data && res.data.length === 0) {
        createPickBanRow(round, email.trim(), team_slug, opponent, home, matchUUID)
      }
    })
}

export type TMatchResults = {
  contact_person: string
  id: number
  match_1: number | null
  match_2: number | null
  match_3: number | null
  opponent: string
  round: number
  team_slug: string
  confirm: boolean
  winner: boolean
  matchUUID: string
}

export type TTeam = {
  contact_person: string
  id: number
  name: string
  points: number
  team_slug: string
}

export async function confirmMatchResults(contact_person: string, round: number, confirm: boolean, winner: boolean) {
  const { data, error } = await supabase
    .from('match_results')
    .update({ confirm: confirm, winner: winner })
    .eq('contact_person', contact_person)
    .eq('round', round)

  if (error) {
    console.error(error)
    return error
  }
}

export async function updateMatchResults(contact_person: string, round: number, result: number, match: number) {
  let payload = {}
  if (match === 1) {
    payload = {
      match_1: result,
    }
  }

  if (match === 2) {
    payload = {
      match_2: result,
    }
  }

  if (match === 3) {
    payload = {
      match_3: result,
    }
  }

  const { error } = await supabase
    .from('match_results')
    .update(payload)
    .eq('contact_person', contact_person)
    .eq('round', round)

  if (error) {
    console.error(error)
    return error
  }
}

export async function createMatchResultsRow(
  round: number,
  contact_person: string,
  team_slug: string,
  opponent: string,
) {
  await supabase.from('match_results').insert([
    {
      contact_person: contact_person,
      round: round,
      team_slug: team_slug,
      opponent: opponent,
      match_1: null,
      match_2: null,
      match_3: null,
      confirm: false,
    },
  ])
}
