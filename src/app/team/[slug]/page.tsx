import { urlForImage } from '../../../../sanity/lib/image'
import Image from 'next/image'
import { PlayerInfoFromRaiderIo } from '@/app/components/PlayerInfoFromRaiderIo'
import { getToken } from '@/app/api/blizzard/getWoWToken'
import { getTyrannicalLeaderboardData } from '@/app/api/leaderboard/tyrannical'
import { Player, getAllTeams } from '@/app/api/getAllTeams'
import { Suspense } from 'react'
import { dungeonConfig, getDungeonInfo } from '@/utils/dungeonHelpers'
import atalImg from '../../../../public/dungeons/atal.webp'
import blackrookholdImg from '../../../../public/dungeons/blackrookhold.webp'
import darkheartImg from '../../../../public/dungeons/darkheart.webp'
import everbloomImg from '../../../../public/dungeons/everbloom.webp'
import fallImg from '../../../../public/dungeons/fall.webp'
import riseImg from '../../../../public/dungeons/rise.webp'
import throneImg from '../../../../public/dungeons/throne.webp'
import waycrestImg from '../../../../public/dungeons/waycrest.webp'
import { Skeleton } from '@/components/ui/skeleton'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: { slug: string } }) {
  const token = await getToken()
  const leaderboard = await getTyrannicalLeaderboardData()
  const allTeams = await getAllTeams()
  const data = allTeams.find((e) => e.teamSlug === params.slug)
  const idForRef = allTeams.find((e) => e.teamName === data?.teamName)?._id

  const alts = data?.players
    .map((player) => {
      return player.alts?.map((alt) => {
        return {
          id: alt.altCharacterName,
          characterName: alt.altCharacterName,
          realmName: alt.altRealmName,
          altOf: player.characterName,
          alts: [],
        }
      })
    })
    .filter((e) => e !== undefined && e.length > 0)

  const hasAltCharacters = data?.players.some((player) => player.alts && player.alts.length > 0)

  const { timeForTeam } = getDungeonInfo(leaderboard, idForRef)

  const dungtimes = Object.keys(timeForTeam).map((e) => {
    return {
      dungeon: dungeonConfig.find((a) => a.id === e.toString())?.name,
      time: timeForTeam[e],
    }
  })

  const hasDungTimes = Object.entries(dungtimes).some((e) => e[1].time !== undefined)

  if (allTeams.find((e) => e.teamSlug === params.slug) === undefined) return notFound()

  return (
    <div className="max-w-full flex justify-center">
      <div className="mt-24">
        <div className="flex  items-center lg:flex-row md:flex-row flex-col">
          <Suspense fallback={<Skeleton className="h-36 w-36 rounded-full" />}>
            <Image
              alt=""
              style={{ border: '10px solid #2e2c37' }}
              src={urlForImage(data?.teamImage?.asset._ref as string) as string}
              width={200}
              height={200}
              className="rounded-full h-44 w-44 "
            />
            <Suspense fallback={<Skeleton className="h-4 w-[250px]" />}>
              <div className=" text-white font-bold text-xl md:text-2xl ml-4 mt-4">{data?.teamName?.toUpperCase()}</div>
            </Suspense>
          </Suspense>
        </div>

        <div className="mt-12 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-4 ">
          <Suspense
            fallback={
              <div>
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
            }
          >
            {data?.players.map((player, index) => {
              if (data.players === null || data.players === undefined) return
              return <PlayerInfoFromRaiderIo key={index} player={player} token={token} isCaptain={index === 0} />
            })}
          </Suspense>
        </div>
        <div className="mt-10 grid grid-cols-2 xs:grid-cols-3  sm:grid-cols-3  md:grid-cols-5 gap-4 ">
          <Suspense
            fallback={
              <div className="mt-10 grid grid-cols-3 gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
            }
          >
            {hasAltCharacters &&
              alts?.map((alt, index) => {
                return <PlayerInfoFromRaiderIo key={index} player={alt?.[0] as unknown as Player} token={token} />
              })}
          </Suspense>
        </div>
        <div>
          {hasDungTimes && <h3 className=" mt-10 mb-4 font-extrabold text-white">Dungeon times</h3>}

          <Suspense
            fallback={
              <div className="flex">
                <Skeleton className="h-12 w-12 rounded-full" /> <Skeleton className="h-4 w-[250px]" />
              </div>
            }
          >
            {dungtimes.map((dungeon) => {
              if (dungeon.time === undefined) return null
              let imgSrc
              if (dungeon.dungeon?.trim() === 'Black Rook Hold') imgSrc = blackrookholdImg
              if (dungeon.dungeon === "Atal'Dazar") imgSrc = atalImg
              if (dungeon.dungeon === 'Darkheart Thicket') imgSrc = darkheartImg
              if (dungeon.dungeon === 'Everbloom') imgSrc = everbloomImg
              if (dungeon.dungeon?.includes('Fall')) imgSrc = fallImg
              if (dungeon.dungeon?.includes('Rise')) imgSrc = riseImg
              if (dungeon.dungeon?.includes('Throne')) imgSrc = throneImg
              if (dungeon.dungeon?.includes('Waycrest')) imgSrc = waycrestImg

              return (
                <div key={dungeon.dungeon} className="mb-1">
                  <div className="flex gap-2 items-center text-white bg-[#052D49] even:bg-[#0B436C]  p-2 rounded-lg ">
                    <Image className="rounded-full" src={imgSrc ?? ''} alt="" width={50} height={50} priority />
                    {dungeon.dungeon} <br />
                    {dungeon.time?.minutes}:{dungeon.time?.seconds}
                  </div>
                </div>
              )
            })}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
