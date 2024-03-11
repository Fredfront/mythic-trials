import TeamCard from './components/TeamCard'
import { getAllTeams } from './api/getAllTeams'
import Link from 'next/link'
import { getFrontpageData } from './api/frontpage/frontpage'
import { urlForImage } from '../../sanity/lib/image'
import { get } from '@vercel/edge-config'
import logo from '../../public/MT_logo_white.webp'
import Image from 'next/image'
import localFont from 'next/font/local'
import { LeaderboardDrawer } from './components/DrawerComponent'
import { getFrontpageNews } from './api/frongpageNews/getFrontpageNewsData'
import { PortableText } from '@portabletext/react'
const LifeCraft = localFont({ src: '../../public/fonts/LifeCraft_Font.woff2' })
const Home = async () => {
  const allTeams = await getAllTeams()
  const frontpageData = await getFrontpageData()
  const showLeaderboard = await get('showLeaderboard')
  const frontpageNews = await getFrontpageNews()

  return (
    <main>
      <div className="flex flex-col items-center ">
        <div
          style={{
            backgroundImage: `url(${urlForImage(frontpageData.mainImage.asset._ref as string) as string})`,
          }}
          className={`flex flex-col items-center justify-center h-screen w-full bg-cover bg-center bg-no-repeat  `}
        >
          <Image src={logo} alt="Nerdelandslaget" width={250} height={250} className=" -mb-7 -mt-16" />
          <h2 className={`${LifeCraft.className} text-8xl text-white `}>sesong 2</h2>
          <p className="text-center  font-medium text-white">
            Vi er tilbake for sesong 2 av Mythic Trials arrangert av Nerdelandslaget WoW.{' '}
          </p>
          <div className="flex gap-4 mt-10 ">
            <Link href="/rules">
              <button className="bg-white rounded-xl text-black border-2 border-[#FDB202] px-3 py-3  transition translate duration-500 hover:scale-105 min-w-44 md:min-w-52 min-h-10 ">
                Hvem kan være med?
              </button>
            </Link>
            <Link href="/signup" prefetch>
              <button className="  min-h-10 px-4 py-3.5 rounded-xl   bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-36 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white transition translate duration-500 hover:scale-105">
                Påmelding
              </button>
            </Link>
          </div>
        </div>
        <div className="gap-4  text-[#FCD20A] font-normal hidden lg:flex  p-4  ">
          <div>RUNDE 1: 20.05.2024 </div>|<div>RUNDE 2: 20.05.2024</div>
          <div>RUNDE 3: 20.05.2024</div> |<div>RUNDE 4: 20.05.2024</div>|<div>RUNDE 5: 20.05.2024</div>|
          <div>RUNDE 6: 20.05.2024</div>|<div>FINALE 1: 20.05.2024</div>|<div>FINALE 2: 20.05.2024</div>
        </div>
        <div id="teams" className=" mt-12 ">
          <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-6 mt-10 max-w-7xl mb-10 ">
            {allTeams &&
              allTeams
                .slice()
                .sort((a, b) => {
                  return a.teamSlug.localeCompare(b.teamSlug)
                })
                .map((team) => (
                  <Link
                    className=" rounded-md transition translate duration-500 "
                    prefetch={true}
                    href={`/team/${team.teamSlug}`}
                    key={team._id}
                  >
                    <TeamCard key={team._id} team={team} />
                  </Link>
                ))}
          </div>
        </div>
        {frontpageNews &&
          frontpageNews.map((news, index) => {
            const isEvenIndex = index % 2 === 0
            return (
              <div
                key={news._id}
                className={`flex flex-col lg:flex-row max-w-7xl lg:mt-32 mt-2 gap-10 p-4 ${!isEvenIndex ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="lg:w-1/2 w-full">
                  <h3 className="text-4xl mb-6 font-bold text-white">{news.headline}</h3>
                  <PortableText value={news.content} />
                </div>
                <div className="lg:w-1/2 w-full">
                  <Image
                    src={urlForImage(news.mainImage.asset._ref)}
                    alt=""
                    width={600}
                    height={600}
                    className="rounded-xl"
                  />
                </div>
                {index !== frontpageNews.length - 1 && (
                  <div className="w-full border-t border-gray-300 mt-6 lg:hidden"></div>
                )}
              </div>
            )
          })}

        <div className="mt-10 md:mt-24 lg:mt-24">
          <LeaderboardDrawer />
        </div>
      </div>
    </main>
  )
}

export default Home
