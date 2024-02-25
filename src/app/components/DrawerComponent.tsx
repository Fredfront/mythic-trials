import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import LeaderboardComponent from './Leaderboard'

export async function LeaderboardDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="font-extrabold w-40 min-h-12 bg-white text-black hover:bg-black hover:text-white  "
        >
          Se leaderboard
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-black">
        <LeaderboardComponent />
      </DrawerContent>
    </Drawer>
  )
}
