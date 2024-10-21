'use client'
import supabase from '@/utils/supabase/client'
import React from 'react'
import
{
  useGenerateRoundRobin,
} from '../../turnering/hooks/useGenerateRoundRobin'
import { NextResponse } from 'next/server'
import BracketPreview from '@/components/bracket-preview'
import { SupabaseTeamType, TournamentSchedule } from '../../../../../types'
import { useGetUserData } from '@/app/auth/useGetUserData'
import { useRouter } from 'next/navigation'

export function CreateMatches({
  roundDates,
  teams,
  email,
  schedule
}: {
  roundDates: { round: number; round_date: string }[]
  teams: SupabaseTeamType[]
  email: string
  schedule: TournamentSchedule
})
{
  const { detailedSchedule } = useGenerateRoundRobin(roundDates, teams, email)

  const initialSchedule = detailedSchedule

  const { user, loading } = useGetUserData()
  const router = useRouter()

  if (loading) return <div>Loading...</div>

  if (user?.data.user?.email !== 'fredrickvaagen@hotmail.com') return <div>Not authorized</div>


  return (
    <>
      {schedule ? <div>Bracket already made</div> : <BracketPreview schedule={schedule} intitalSchedule={initialSchedule} />}
    </>
  )
}

export async function createRoundRobin(roundRobinData: TournamentSchedule)
{
  try {
    // Step 1: Extract Unique Teams
    const teamMap = new Map<string, { name: string; team_slug: string }>()
    roundRobinData.flat().forEach((match) =>
    {
      match.teams.forEach((team) =>
      {
        if (!teamMap.has(team.team_slug)) {
          teamMap.set(team.team_slug, {
            name: team.name,
            team_slug: team.team_slug,
          })
        }
      })
    })

    const uniqueTeams = Array.from(teamMap.values())

    // Step 2: Fetch Existing Teams from Database
    const { data: existingTeams, error: fetchError } = await supabase.from('teams').select('id, team_slug')

    if (fetchError) {
      console.error('Error fetching existing teams:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch existing teams' }, { status: 500 })
    }

    const existingTeamMap = new Map<string, string>() // Map<team_slug, id>
    existingTeams.forEach((team: { id: string; team_slug: string }) =>
    {
      existingTeamMap.set(team.team_slug, team.id)
    })

    // Step 3: Determine Teams to Insert
    const teamsToInsert = uniqueTeams.filter((team) => !existingTeamMap.has(team.team_slug))

    let insertedTeams: Array<{ id: string; team_slug: string }> = []
    if (teamsToInsert.length > 0) {
      const { data, error } = await supabase.from('teams').insert(teamsToInsert).select('id, team_slug')

      if (error) {
        console.error('Error inserting teams:', error)
        return NextResponse.json({ error: 'Failed to insert new teams' }, { status: 500 })
      }

      insertedTeams = data
    }

    // Step 4: Update Existing Team Map with Inserted Teams
    insertedTeams.forEach((team) =>
    {
      existingTeamMap.set(team.team_slug, team.id)
    })

    // Step 5: Prepare Matches Data Including 'featured'
    const matchesToInsert: Array<{
      match_uuid: string
      round: number
      round_date: string
      round_startTime: string
      home_team_id: string
      away_team_id: string
      featured: boolean
    }> = []

    // Collect featured matches per round
    const featuredMatchesByRound: Map<number, string> = new Map()

    roundRobinData.forEach((round) =>
    {
      round.forEach((match) =>
      {
        const [ homeTeam, awayTeam ] = match.teams
        const homeTeamId = existingTeamMap.get(homeTeam.team_slug)
        const awayTeamId = existingTeamMap.get(awayTeam.team_slug)

        if (!homeTeamId || !awayTeamId) {
          console.error(`Team IDs not found for match UUID: ${match.teams[ 0 ].matchUUID}`)
          return
        }

        // Use provided round_startTime or default to '20:00:00'
        const startTime = homeTeam.round_startTime || '20:00:00'

        matchesToInsert.push({
          match_uuid: match.teams[ 0 ].matchUUID,
          round: homeTeam.round,
          round_date: homeTeam.roundDate, // Ensure this is in 'YYYY-MM-DD' format
          round_startTime: startTime, // Set the start time
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          featured: match.featured, // Include featured status
        })

        // If this match is featured, record it
        if (match.featured) {
          featuredMatchesByRound.set(homeTeam.round, match.teams[ 0 ].matchUUID)
        }
      })
    })

    // Step 6: Unfeature Other Matches in the Same Rounds
    for (const [ round, featuredMatchUUID ] of featuredMatchesByRound.entries()) {
      const { error: updateError } = await supabase
        .from('matches')
        .update({ featured: false })
        .eq('round', round)
        .neq('match_uuid', featuredMatchUUID)

      if (updateError) {
        console.error(`Error unfeaturing other matches in round ${round}:`, updateError)
        return NextResponse.json({ error: `Failed to update featured matches in round ${round}` }, { status: 500 })
      }
    }

    // Step 7: Upsert Matches
    if (matchesToInsert.length > 0) {
      const { data, error } = await supabase.from('matches').upsert(matchesToInsert, { onConflict: 'match_uuid' })

      if (error) {
        console.error('Error upserting matches:', error)
        return NextResponse.json({ error: 'Failed to upsert matches' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Matches upserted successfully', data }, { status: 200 })
    } else {
      return NextResponse.json({ message: 'No matches to upsert.' }, { status: 200 })
    }
  } catch (error: any) {
    console.error('Error inserting/upserting round robin data:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}