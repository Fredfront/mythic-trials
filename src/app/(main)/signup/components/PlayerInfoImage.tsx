'use client'
import { Player } from '@/app/api/getAllTeams'
import { getRaiderIOCharacerData } from '@/app/api/getCharacerData'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'

export const PlayerInfoImage = ({ player }: { player: Player }) => {
  const [playerInfo, setPlayerInfo] = useState<any>(null)

  // Define a debounced function for fetching player info
  const debouncedGetPlayerInfo = debounce(async () => {
    const info = await getRaiderIOCharacerData({ characterName: player.characterName, realmName: player.realmName })
    setPlayerInfo(info)
  }, 500)

  useEffect(() => {
    // Call the debounced function when player changes
    debouncedGetPlayerInfo()

    // Cleanup function to cancel any pending debounced calls when component unmounts
    return () => {
      debouncedGetPlayerInfo.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player])

  return (
    <div>
      <Avatar className="rounded-r-lg rounded-l-none">
        <AvatarImage className="rounded-none" src={playerInfo?.thumbnail_url} alt="" />
      </Avatar>
    </div>
  )
}
