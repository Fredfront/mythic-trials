import TeamCard from './components/TeamCard'
import { getAllTeams } from './api/getAllTeams'
import Link from 'next/link'
import { getFrontpageData } from './api/frontpage/frontpage'
import { urlForImage } from '../../sanity/lib/image'
import { Button } from '@/components/ui/button'
import { LeaderboardDrawer } from './components/DrawerComponent'
import { Headline, SubHeadline } from './components/text-generate-effect'
import { get } from '@vercel/edge-config'
const Home = async () => {
  const allTeams = await getAllTeams()
  const frontpageData = await getFrontpageData()
  const showLeaderboard = await get('showLeaderboard')

  return (
    <main>
      <div className="flex flex-col items-center ">
        <div
          style={{
            backgroundImage: `url(${urlForImage(frontpageData.mainImage.asset._ref as string) as string})`,
          }}
          className={`flex flex-col items-center justify-center h-screen w-full bg-cover bg-center bg-no-repeat `}
        >
          <Headline
            className="text-3xl md:text-5xl lg:text-8xl xl:text-8xl font-poppins text-white"
            words={frontpageData.headline}
          />
          <SubHeadline words="Presentert av Nerdelandslaget WoW Community" />
          <div className="flex gap-4 mt-10 ">
            <Link href="/signup">
              <Button className="w-40 min-h-12 font-poppins font-bold ">Påmelding</Button>
            </Link>
            {showLeaderboard ? <LeaderboardDrawer /> : null}
          </div>
        </div>
        <div className="max-w-7xl  mt-12 min-h-dvh ">
          <h2 id="teams" className="text-center text-6xl font-extrabold text-primary  ">
            LAGENE
          </h2>
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
