import { WoWCharacter, getRaiderIOCharacerData } from '../api/getCharacerData'
import Image from 'next/image'
import { CharacterData, getWowCharacterFromBlizzard } from '../api/blizzard/getWowCharacterInfo'
import { getMythicPlusInfo } from '../api/blizzard/getMythicPlusInfo'
import { classColors } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Player } from '../api/getAllTeams'
import { Crown } from 'lucide-react'
import FallbackImage from '../../../public/image-avatar-avatar-fallback.svg'

type PlayerInfoProps = {
  player: Player
  token: string
  isCaptain?: boolean
}
export const PlayerInfoFromRaiderIo = async ({ player, token, isCaptain }: PlayerInfoProps) => {
  const raiderIo = await getRaiderIOCharacerData({ characterName: player?.characterName, realmName: player?.realmName })
  const blizzCharacterData = await getWowCharacterFromBlizzard({
    token,
    realm: player?.realmName?.toLowerCase(),
    character: player?.characterName?.toLowerCase(),
  })

  const mythicPlusInfo = await getMythicPlusInfo({ token, endpoint: blizzCharacterData?.mythic_keystone_profile?.href })

  let wowClass = raiderIo?.class
  if (wowClass === 'Death Knight') {
    wowClass = 'DeathKnight'
  }
  if (wowClass === 'Demon Hunter') {
    wowClass = 'DemonHunter'
  }

  const classColor = classColors[wowClass as keyof typeof classColors]

  return (
    <CharacterInfo
      data={raiderIo}
      classColor={classColor}
      blizzCharacterData={blizzCharacterData}
      mythicPlusInfo={mythicPlusInfo?.current_mythic_rating}
      player={player}
      isCaptain={isCaptain}
    />
  )
}

type HoverStuffProps = {
  data: WoWCharacter | null
  classColor: string
  blizzCharacterData: CharacterData | null
  mythicPlusInfo: any
  player: any
  isCaptain?: boolean
}
const CharacterInfo = ({
  data,
  classColor,
  blizzCharacterData,
  mythicPlusInfo,
  player,
  isCaptain,
}: HoverStuffProps) => {
  const ratingColor = `rgb(${mythicPlusInfo?.color?.r}, ${mythicPlusInfo?.color.g}, ${mythicPlusInfo?.color.b})`

  return (
    <Dialog>
      <DialogTrigger asChild className=" cursor-pointer transition translate duration-500 hover:scale-105">
        <div className="mb-3">
          <div className="flex flex-col items-center">
            <Image
              style={{ border: '6px solid #2e2c37' }}
              className="w-20 h-20 rounded-full"
              src={data?.thumbnail_url || FallbackImage}
              alt=""
              width={80}
              height={80}
            />

            <div className="text-white flex item-center justify-between">
              <span>{data?.name || player.characterName} </span>
              {isCaptain === true ? (
                <span>
                  <Crown className="inline" fill="#FDB202" color="#FDB202" height={10} />
                </span>
              ) : null}
            </div>
            {player && player.altOf && player.altOf.length > 0 ? (
              <div className=" text-xs text-white">Alt av {player.altOf}</div>
            ) : null}

            <div className="text-sm" style={{ color: classColor }}>
              {data?.class}
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#011624]">
        <DialogHeader>
          <DialogTitle>{data?.name}</DialogTitle>
          <DialogDescription>Guild: {blizzCharacterData?.guild?.name}</DialogDescription>
          <DialogDescription style={{ color: ratingColor }}>
            {' '}
            M+ {(mythicPlusInfo?.rating ? Math.floor(parseInt(mythicPlusInfo?.rating)) : 'N/A') || 'N/A'}
          </DialogDescription>
          <DialogDescription>Ilvl {blizzCharacterData?.equipped_item_level}</DialogDescription>
        </DialogHeader>
        <a href={data?.profile_url} target="_blank">
          <DialogFooter>Gå til raider.io</DialogFooter>{' '}
        </a>
      </DialogContent>
    </Dialog>
  )
}
