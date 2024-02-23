import TeamCard from './components/TeamCard'
import { getAllTeams } from './api/getAllTeams'
import Link from 'next/link'
import { getFrontpageData } from './api/frontpage/frontpage'
import { urlForImage } from '../../sanity/lib/image'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { LeaderboardDrawer } from './components/DrawerComponent'

const Home = async () => {
  const allTeams = await getAllTeams()
  const frontpageData = await getFrontpageData()

  return (
    <main>
      <div className="flex flex-col max-w-7xl m-auto ">
        <div className="flex flex-col items-center justify-center h-svh">
          <Image
            className=" rounded-2xl w-3/4"
            width={400}
            height={400}
            src={urlForImage(frontpageData.mainImage.asset._ref)}
            alt="main image"
          />
          <h1 className=" mt-6 mb-4 text-4xl md:text-5xl lg:text-6xl font-extrabold">{frontpageData.headline}</h1>
          <h2 className="font-thin">{frontpageData.smallTextDescription}</h2>
          <Button className="mt-4 font-extrabold w-2/6">Påmelding</Button>
        </div>
        <div>
          <h1 className="text-center text-6xl font-extrabold">LAGENE</h1>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 mt-10 p-2 min-w-full mb-10 ">
            {allTeams &&
              allTeams
                .slice()
                .sort((a, b) => {
                  return a.teamSlug.localeCompare(b.teamSlug)
                })
                .map((team) => (
                  <Link href={`/team/${team.teamSlug}`} key={team._id}>
                    <TeamCard key={team._id} team={team} />
                  </Link>
                ))}
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col items-center justify-center">
        <LeaderboardDrawer />
      </div>
    </main>
  )
}

export default Home
