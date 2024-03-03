import { getRaiderIOCharacerData } from '@/app/api/getCharacerData'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { debounce } from 'lodash'
import { useEffect, useState } from 'react'

type ExtendedPlayer = {
  characterName: string
  realmName: string
  altOf?: string
}
export const PlayerInfo = ({ player }: { player: ExtendedPlayer }) => {
  const [playerInfo, setPlayerInfo] = useState<any>(null)

  // Define a debounced function for fetching player info
  const debouncedGetPlayerInfo = debounce(async () => {
    const info = await getRaiderIOCharacerData({ characterName: player.characterName, realmName: player.realmName })
    setPlayerInfo(info)
  }, 100)

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
    <div className="flex flex-col items-center mb-2 mt-2">
      <Avatar className="mr-1 rounded-full">
        <AvatarImage src={playerInfo?.thumbnail_url} alt="" />
      </Avatar>
      <p className="">{player.characterName}</p>
      <p className="m-0 text-xs">{player.realmName}</p>
      {player.altOf && <p className="m-0 text-xs">Alt av: {player.altOf}</p>}
    </div>
  )
}
