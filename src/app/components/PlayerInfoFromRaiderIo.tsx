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

type PlayerInfoProps = {
  player: Player
  token: string
}
export const PlayerInfoFromRaiderIo = async ({ player, token }: PlayerInfoProps) => {
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
    />
  )
}

type HoverStuffProps = {
  data: WoWCharacter | null
  classColor: string
  blizzCharacterData: CharacterData | null
  mythicPlusInfo: any
  player: any
}
const CharacterInfo = ({ data, classColor, blizzCharacterData, mythicPlusInfo, player }: HoverStuffProps) => {
  const ratingColor = `rgb(${mythicPlusInfo?.color?.r}, ${mythicPlusInfo?.color.g}, ${mythicPlusInfo?.color.b})`
  return (
    <Dialog>
      <DialogTrigger asChild className="hover: cursor-pointer zoom-in-50 ">
        <div className="mb-3">
          <div className="flex flex-col items-center">
            {data?.thumbnail_url ? (
              <Image
                style={{ border: '6px solid #2e2c37' }}
                className="w-20 h-20 rounded-full"
                src={data?.thumbnail_url || ''}
                alt=""
                width={80}
                height={80}
              />
            ) : null}

            <div>{data?.name}</div>
            {player && player.altOf && player.altOf.length > 0 ? (
              <div className=" text-xs">Alt av {player.altOf}</div>
            ) : null}
            <div className="text-sm" style={{ color: classColor }}>
              {data?.class}
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black">
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
