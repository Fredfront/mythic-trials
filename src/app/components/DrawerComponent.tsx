import * as React from 'react'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import LeaderboardComponent from './Leaderboard'

export async function LeaderboardDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className="font-extrabold w-40 transition transform hover:scale-105 duration-500 min-h-12  rounded-md text-white hover:bg-white "
          style={{
            background: 'linear-gradient(181.7deg, #028AFD 28.95%, #106ABC 98.56%)',
            padding: '8px 20px',
            boxShadow: '0px 2px 4px 0px #00000040',
          }}
        >
          Se resultater
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-[#011624] border-none">
        <LeaderboardComponent />
      </DrawerContent>
    </Drawer>
  )
}
