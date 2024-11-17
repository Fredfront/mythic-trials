import { PickAndBansType } from '@/supabase/dbFunctions'
import { serviceServerClient } from '@/utils/supabase/serviceServerClient'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = (await request.json()) as {
      contact_person: string
      round: number
      ready: boolean
      step: number
      pick: number
      isBo2: boolean
      myTeamData: PickAndBansType
      homeTeam: string
    }

    // Initialize Supabase client
    const client = await serviceServerClient()
    const isBestOfTwo = body.isBo2
    const isHomeTeam = body.myTeamData.team_slug === body.homeTeam

    const isCompletedBo2 = isHomeTeam ? body.step === 4 : !isHomeTeam && body.step === 3
    const isCompletedBo3 = isHomeTeam ? body.step === 6 : !isHomeTeam && body.step === 7

    const isCompleted = isBestOfTwo ? isCompletedBo2 : isCompletedBo3

    // Perform the update operation and await its completion
    const { data: myData, error } = await client
      .from('pick_ban')
      .update({ ready: body.ready, my_turn: false, step: body.step + 2, pick: body.pick, completed: isCompleted })
      .eq('round', body.round)
      .eq('contact_person', body.contact_person)

    //Update oppoents turn
    const { data: opponentData, error: error2 } = await client
      .from('pick_ban')
      .update({ my_turn: true })
      .eq('round', body.round)
      .neq('contact_person', body.contact_person)

    // Handle potential errors from Supabase
    if (error) {
      console.error('Error updating ready status:', error)
      return NextResponse.json({ error: 'Failed to update ready status', details: error.message }, { status: 500 })
    }

    if (error2) {
      console.error('Error updating ready status:', error)
      return NextResponse.json({ error: 'Failed to update ready status', details: error2.message }, { status: 500 })
    }

    // Respond with success
    return NextResponse.json({ status: 200, opponentData, myData })
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 })
  }
}
