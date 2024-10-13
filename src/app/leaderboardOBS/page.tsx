import React, { Suspense } from 'react'
import LeaderboardComponentOBS from '../components/LeaderboardOBS'
import Loading from '../(main)/signup/components/Loading'

function page()
{
  return <Suspense fallback={<div>Loading...<Loading /></div>}><LeaderboardComponentOBS /></Suspense>
}

export default page
