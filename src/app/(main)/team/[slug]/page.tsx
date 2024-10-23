import { urlForImage } from '../../../../../sanity/lib/image'
import Image from 'next/image'
import { PlayerInfoFromRaiderIo } from '@/app/components/PlayerInfoFromRaiderIo'
import { getToken } from '@/app/api/blizzard/getWoWToken'
import { getTyrannicalLeaderboardData } from '@/app/api/leaderboard/tyrannical'
import { Player, getAllTeams } from '@/app/api/getAllTeams'
import { Suspense } from 'react'
import { getDungeonInfo } from '@/utils/dungeonHelpers'
import { Skeleton } from '@/components/ui/skeleton'
import { notFound } from 'next/navigation'

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const token = await getToken()
  const tyrannical = await getTyrannicalLeaderboardData()
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

  const { timeForTeam: timeForTeamTyrannical } = getDungeonInfo(tyrannical, idForRef)

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
                return alt?.map((e) => {
                  return <PlayerInfoFromRaiderIo key={index} player={e as unknown as Player} token={token} />
                })
              })}
          </Suspense>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-2">
          <div>
            <Suspense
              fallback={
                <div className="flex">
                  <Skeleton className="h-12 w-12 rounded-full" /> <Skeleton className="h-4 w-[250px]" />
                </div>
              }
            ></Suspense>
          </div>

          <div>
            <Suspense
              fallback={
                <div className="flex">
                  <Skeleton className="h-12 w-12 rounded-full" /> <Skeleton className="h-4 w-[250px]" />
                </div>
              }
            ></Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
