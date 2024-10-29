import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ServerClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      match_uuid: string
      contact_person: string
      round: number
      opponent: string
      team_slug: string
    }

    // Update rows where contact_person matches the request
    const { error: error1 } = await ServerClient.from('match_results')
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

    if (error1) {
      console.error('Error in first update:', error1)
      return NextResponse.json({ error: 'Failed to update match result for contact person' }, { status: 500 })
    }

    const opponentContactPerson = await ServerClient.from('teams')
      .select('contact_person')
      .eq('team_slug', body.opponent)

    // Update rows where contact_person does NOT match the request
    const { error: error2 } = await ServerClient.from('match_results')
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
        contact_person: opponentContactPerson.data?.[0].contact_person,
      })
      .eq('match_uuid', body.match_uuid)
      .eq('round', body.round)
      .neq('contact_person', body.contact_person)

    if (error2) {
      console.error('Error in second update:', error2)
      return NextResponse.json({ error: 'Failed to update match result for other contacts' }, { status: 500 })
    }

    const new_match_restuls = (await ServerClient.from('match_results').select('*')).data?.map((e) => {
      return {
        ...e,
        contact_person: undefined,
      }
    })

    return NextResponse.json({ status: 200, message: 'Update successful', data: new_match_restuls })
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 })
  }
}
