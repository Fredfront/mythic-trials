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
      <h1 className="text-center text-4xl font-extrabold mb-10 ">LEADERBOARD</h1>
      <LeaderboardComponent />
    </div>
  )
}

export default page
