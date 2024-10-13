import { ServerClient } from '@/utils/supabase/server'
import React from 'react'

async function Page() {
  const admins = await ServerClient.from('admins').select('*')

  return (
    <>
      <div className="text-center p-4 text-4xl font-bold">Dashbord</div>
    </>
  )
}

export default Page
