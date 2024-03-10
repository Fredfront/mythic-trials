import React from 'react'
import LeaderboardComponent from '../components/Leaderboard'
import { get } from '@vercel/edge-config'
import { redirect } from 'next/navigation'

async function page() {
  const showLeaderboard = await get('showLeaderboard')

  if (!showLeaderboard) {
    return redirect('/')
  }

  return (
    <div>
      <h1 className="text-center text-white text-4xl mt-10 font-bold">Resultater</h1>
      <LeaderboardComponent />
    </div>
  )
}

export default page
