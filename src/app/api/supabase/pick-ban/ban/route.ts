import { serviceServerClient } from '@/utils/supabase/serviceServerClient'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = (await request.json()) as {
      contact_person: string
      round: number
      bans: number[]
      step: number
    }

    // Initialize Supabase client
    const client = await serviceServerClient()

    // Perform the update operation and await its completion
    const { error } = await client
      .from('pick_ban')
      .update({ bans: body.bans, my_turn: false, step: body.step + 2 })
      .eq('round', body.round)
      .eq('contact_person', body.contact_person)

    //Update oppoents turn
    const { error: error2 } = await client
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
    return NextResponse.json({ status: 200 })
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 })
  }
}
