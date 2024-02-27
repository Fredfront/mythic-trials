import TeamCard from './components/TeamCard'
import { getAllTeams } from './api/getAllTeams'
import Link from 'next/link'
import { getFrontpageData } from './api/frontpage/frontpage'
import { urlForImage } from '../../sanity/lib/image'
import { Button } from '@/components/ui/button'
import { LeaderboardDrawer } from './components/DrawerComponent'

const Home = async () => {
  const allTeams = await getAllTeams()
  const frontpageData = await getFrontpageData()

  return (
    <main>
      <div className="flex flex-col items-center ">
        <div
          style={{
            backgroundImage: `url(${urlForImage(frontpageData.mainImage.asset._ref as string) as string})`,
          }}
          className={`flex flex-col items-center justify-center h-screen w-full bg-cover bg-center bg-no-repeat `}
        >
          <h1 className="  text-4xl md:text-5xl lg:text-6xl font-bold text-primary">{frontpageData.headline}</h1>
          <h2 className="font-thin">{frontpageData.smallTextDescription}</h2>
          <div className="flex gap-4 mt-10 ">
            <Link href="/signup">
              <Button variant="outline" className="font-extrabold w-40 min-h-12 bg-primary ">
                Påmelding
              </Button>
            </Link>
            <LeaderboardDrawer />
          </div>
        </div>
        <div className="max-w-7xl  grid place-content-center mt-12">
          <h1 id="teams" className="text-center text-6xl font-extrabold text-primary  ">
            LAGENE
          </h1>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 mt-10 p-2 min-w-full mb-10 ">
            {allTeams &&
              allTeams
                .slice()
                .sort((a, b) => {
                  return a.teamSlug.localeCompare(b.teamSlug)
                })
                .map((team) => (
                  <Link prefetch={true} href={`/team/${team.teamSlug}`} key={team._id}>
                    <TeamCard key={team._id} team={team} />
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home
