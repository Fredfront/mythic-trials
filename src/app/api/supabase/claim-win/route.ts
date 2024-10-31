import { serviceServerClient } from '@/utils/supabase/serviceServerClient'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      match_uuid: string
      contact_person: string
      round: number
      opponent: string
      team_slug: string
    }

    const test = (await serviceServerClient()).from('match_results').select('*')

    // Update rows where contact_person matches the request
    const matchResults = (await serviceServerClient())
      .from('match_results')
      .update({
        claimed_win: true,
        match_1: 1,
        match_2: 1,
        match_3: null,
        confirm: true,
        winner: true,
      })
      .eq('match_uuid', body.match_uuid)
      .eq('round', body.round)
      .eq('contact_person', body.contact_person)

    if ((await matchResults).error) {
      console.error('Error in first update:', (await matchResults).error)
      return NextResponse.json({ error: 'Failed to update match result for contact person' }, { status: 500 })
    }

    const opponentContactPerson = (await serviceServerClient())
      .from('teams')
      .select('contact_person')
      .eq('team_slug', body.opponent)

    // Update rows where contact_person does NOT match the request
    const matchResults2 = (await serviceServerClient())
      .from('match_results')
      .upsert({
        claimed_win: false,
        match_1: 0,
        match_2: 0,
        match_3: null,
        confirm: true,
        winner: false,
        match_uuid: body.match_uuid,
        round: body.round,
        team_slug: body.opponent,
        opponent: body.team_slug,
        contact_person: (await opponentContactPerson)?.data?.[0].contact_person,
      })
      .eq('match_uuid', body.match_uuid)
      .eq('round', body.round)
      .neq('contact_person', body.contact_person)

    if ((await matchResults2).error) {
      console.error('Error in second update:', (await matchResults2).error)
      return NextResponse.json({ error: 'Failed to update match result for other contacts' }, { status: 500 })
    }

    const new_match_restuls = (await serviceServerClient()).from('match_results').select('*')

    const mapped_new_match_results = (await new_match_restuls).data?.map((e) => {
      return {
        ...e,
        contact_person: undefined,
      }
    })

    return NextResponse.json({ status: 200, message: 'Update successful', data: mapped_new_match_results })
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 })
  }
}
