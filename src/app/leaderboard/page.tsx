import React from 'react'
import LeaderboardComponent from '../components/Leaderboard'

async function page() {
  return (
    <div className="grid place-content-center mt-10 ">
      <h1 className="text-center text-4xl font-extrabold mb-10 ">LEADERBOARD</h1>
      <LeaderboardComponent />
    </div>
  )
}

export default page
