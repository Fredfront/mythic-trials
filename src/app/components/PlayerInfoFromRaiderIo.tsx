import { WoWCharacter, getRaiderIOCharacerData } from '../api/getCharacerData'
import { Player } from '../page'
import Image from 'next/image'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { CharacterData, getWowCharacterFromBlizzard } from '../api/blizzard/getWowCharacterInfo'
import { getMythicPlusInfo } from '../api/blizzard/getMythicPlusInfo'

type PlayerInfoProps = {
  player: Player
  token: string
}
export const PlayerInfoFromRaiderIo = async ({ player, token }: PlayerInfoProps) => {
  const data = await getRaiderIOCharacerData({ characterName: player.characterName, realmName: player.realmName })
  const blizzCharacterData = await getWowCharacterFromBlizzard({
    token,
    realm: player.realmName.toLowerCase(),
    character: player.characterName.toLowerCase(),
  })

  const mythicPlusInfo = await getMythicPlusInfo({ token, endpoint: blizzCharacterData?.mythic_keystone_profile.href })

  let wowClass = data?.class
  if (wowClass === 'Death Knight') {
    wowClass = 'DeathKnight'
  }
  if (wowClass === 'Demon Hunter') {
    wowClass = 'DemonHunter'
  }

  const classColor = classColors[wowClass as keyof typeof classColors]

  return (
    <CharacterInfo
      data={data}
      classColor={classColor}
      blizzCharacterData={blizzCharacterData}
      mythicPlusInfo={mythicPlusInfo?.current_mythic_rating}
    />
  )
}

type HoverStuffProps = {
  data: WoWCharacter
  classColor: string
  blizzCharacterData: CharacterData | null
  mythicPlusInfo: any
}
const CharacterInfo = ({ data, classColor, blizzCharacterData, mythicPlusInfo }: HoverStuffProps) => {
  const lastCrawledDate = new Date(data.last_crawled_at)

  const day = lastCrawledDate.getDate()
  const month = lastCrawledDate.getMonth()
  const year = lastCrawledDate.getFullYear()

  const combined = `${day}.${month + 1}.${year}`

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {/* <a href={data?.profile_url} target="_blank" className="hover:scale-105 transition-transform"> */}
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
            <div className="text-sm" style={{ color: classColor }}>
              {data?.class}
            </div>
          </div>
        </div>
        {/* </a> */}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Role: {data?.active_spec_role}</h4>
            <p className="text-sm">Spec: {data?.active_spec_name}</p>
            <p className="text-sm">Guild: {blizzCharacterData?.guild?.name}</p>
            <p className="text-sm">Mythic+ Rating: {Math.floor(parseInt(mythicPlusInfo?.rating))}</p>

            <div className="flex items-center pt-2">
              <span className="text-xs text-muted-foreground">Last updated {combined}</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

const classColors = {
  DeathKnight: '#C41F3B',
  DemonHunter: '#A330C9',
  Druid: '#FF7D0A',
  Hunter: '#ABD473',
  Mage: '#40C7EB',
  Monk: '#00FF96',
  Paladin: '#F58CBA',
  Priest: '#FFFFFF',
  Rogue: '#FFF569',
  Shaman: '#0070DE',
  Warlock: '#8787ED',
  Warrior: '#C79C6E',
  Evoker: '#69CCF0',
}
