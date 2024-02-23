import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import LeaderboardComponent from './Leaderboard'

export async function LeaderboardDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Se leaderboard</Button>
      </DrawerTrigger>
      <DrawerContent>
        <LeaderboardComponent />
      </DrawerContent>
    </Drawer>
  )
}
