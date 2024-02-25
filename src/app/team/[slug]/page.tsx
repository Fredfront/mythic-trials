import { urlForImage } from '../../../../sanity/lib/image'
import Image from 'next/image'
import { PlayerInfoFromRaiderIo } from '@/app/components/PlayerInfoFromRaiderIo'
import { getToken } from '@/app/api/blizzard/getWoWToken'
import { LeaderboardData, getTyrannicalLeaderboardData } from '@/app/api/leaderboard/tyrannical'
import { getAllTeams } from '@/app/api/getAllTeams'
import { Suspense } from 'react'
import { dungeonConfig, getDungeonInfo } from '@/utils/dungeonHelpers'
import { getMythicPlusInfoDetails } from '@/app/api/blizzard/getMythicPlusInfoDetails'
import atalImg from '../../../../public/dungeons/atal.webp'
import blackrookholdImg from '../../../../public/dungeons/blackrookhold.webp'
import darkheartImg from '../../../../public/dungeons/darkheart.webp'
import everbloomImg from '../../../../public/dungeons/everbloom.webp'
import fallImg from '../../../../public/dungeons/fall.webp'
import riseImg from '../../../../public/dungeons/rise.webp'
import throneImg from '../../../../public/dungeons/throne.webp'
import waycrestImg from '../../../../public/dungeons/waycrest.webp'
import { Icons } from '@/components/loading'

export default async function Page({ params }: { params: { slug: string } }) {
  const token = await getToken()

  const leaderboard = await getTyrannicalLeaderboardData()
  const allTeams = await getAllTeams()
  const data = allTeams.find((e) => e.teamSlug === params.slug)
  const idForRef = allTeams.find((e) => e.teamName === data?.teamName)?._id
  const mythicPlusDetails = await getMythicPlusInfoDetails({
    token,
    realm: 'draenor',
    character: 'girfaen',
  })
  const { dungeons, timeForTeam } = getDungeonInfo(leaderboard, idForRef)

  const dungtimes = Object.keys(timeForTeam).map((e) => {
    return {
      dungeon: dungeonConfig.find((a) => a.id === e.toString())?.name,
      time: timeForTeam[e],
    }
  })

  return (
    <div className="max-w-full flex justify-center">
      <div className="mt-32">
        <div className="flex  items-center">
          <Suspense
            fallback={
              <Image
                alt=""
                style={{ border: '10px solid #2e2c37' }}
                src={''}
                width={200}
                height={200}
                className="rounded-full h-44 w-44 "
              />
            }
          >
            <Image
              alt=""
              style={{ border: '10px solid #2e2c37' }}
              src={urlForImage(data?.teamImage?.asset._ref as string) as string}
              width={200}
              height={200}
              className="rounded-full h-44 w-44 "
            />
            <div className="text-2xl font-medium ml-4">{data?.teamName?.toUpperCase()}</div>
          </Suspense>
        </div>

        <div className=" mt-20 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-2 gap-4 ">
          <Suspense
            fallback={
              <div className="ml-8 flex">
                Loading <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" />
              </div>
            }
          >
            {data?.players.map((player) => {
              if (data.players === null || data.players === undefined) return
              return <PlayerInfoFromRaiderIo key={player._key} player={player} token={token} />
            })}
          </Suspense>
        </div>
        <div className="ml-4 mt-20">
          <h3 className="mb-4 font-extrabold">Dungeon times</h3>
          <Suspense
            fallback={
              <div>
                Loading <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" />
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
                <div key={dungeon.dungeon} className="mb-4">
                  <div className="font-thin flex gap-2 items-center">
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
