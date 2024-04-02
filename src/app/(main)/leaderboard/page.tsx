import React from 'react'
import LeaderboardComponent from '../../components/Leaderboard'
import { redirect } from 'next/navigation'
import { getShowLeaderboard } from '../../api/featureToggle/getShowLeaderboard'

async function page() {
  const showLeaderboardData = await getShowLeaderboard()
  const showLeaderboard = showLeaderboardData?.[0].enabled

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
