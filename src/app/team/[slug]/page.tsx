import { getTeamByNameFromSanity } from '@/app/api/getTeamFromSanity'
import { urlForImage } from '../../../../sanity/lib/image'
import Image from 'next/image'
import { PlayerInfoFromRaiderIo } from '@/app/components/PlayerInfoFromRaiderIo'
import { getToken } from '@/app/api/blizzard/getWoWToken'

export default async function Page({ params }: { params: { slug: string } }) {
  const data = await getTeamByNameFromSanity(params.slug)
  const token = await getToken()

  return (
    <div className=" max-w-full flex justify-center">
      <div className="mt-32">
        <div className="flex  items-center">
          <Image
            alt=""
            style={{ marginRight: '3rem', border: '10px solid #2e2c37' }}
            src={urlForImage(data?.teamImage.asset._ref)}
            width={200}
            height={200}
            className="rounded-full h-44 w-44 "
          />
          <div className="text-2xl font-medium">{data.teamName.toUpperCase()}</div>
        </div>

        <div className=" mt-20 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-2 gap-4 ">
          {data.players.map((player) => {
            return <PlayerInfoFromRaiderIo key={player._key} player={player} token={token} />
          })}
        </div>
      </div>
    </div>
  )
}
