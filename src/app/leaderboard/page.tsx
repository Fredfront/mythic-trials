import React from 'react'
import LeaderboardComponent from '../components/Leaderboard'
import { get } from '@vercel/edge-config'
import { redirect } from 'next/navigation'
import localFont from 'next/font/local'

const LifeCraft = localFont({ src: './LifeCraft_Font.woff2' })
async function page() {
  const showLeaderboard = await get('showLeaderboard')

  if (!showLeaderboard) {
    return redirect('/')
  }

  return (
    <div>
      <h1 className={`${LifeCraft.className} text-center text-white text-4xl mt-10 `}>Resultater</h1>
      <LeaderboardComponent />
    </div>
  )
}

export default page
