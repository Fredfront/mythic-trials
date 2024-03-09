import * as React from 'react'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import LeaderboardComponent from './Leaderboard'

export async function LeaderboardDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="font-extrabold w-40 transition transform hover:scale-105 duration-500 min-h-12 border-white border-2 rounded-md text-white hover:bg-white hover:text-black ">
          Se leaderboard
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-[#011624] border-none">
        <LeaderboardComponent />
      </DrawerContent>
    </Drawer>
  )
}
