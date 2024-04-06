import React from 'react'
import TeamCard from '../components/TeamCard'
import { getAllTeams } from '../api/getAllTeams'
import Link from 'next/link'
import { getFrontpageData } from '../api/frontpage/frontpage'
import { urlForImage } from '../../../sanity/lib/image'
import logo from '../../../public/MT_logo_white.webp'
import Image from 'next/image'
import localFont from 'next/font/local'
import { getFrontpageNews } from '../api/frongpageNews/getFrontpageNewsData'
import { PortableText } from '@portabletext/react'
import SimplifiedLeaderboard from '../components/SimplifiedLeaderboard'
import { getShowLeaderboard } from '../api/featureToggle/getShowLeaderboard'
const LifeCraft = localFont({ src: '../../../public/fonts/LifeCraft_Font.woff2' })

const Home = async () => {
  const allTeams = await getAllTeams()
  const frontpageData = await getFrontpageData()
  const showLeaderboardData = await getShowLeaderboard()
  const frontpageNews = await getFrontpageNews()

  const showLeaderboard = showLeaderboardData?.[0].enabled

  return (
    <main>
      <div className="flex flex-col items-center ">
        <div
          style={{
            backgroundImage: `url(${urlForImage(frontpageData.mainImage.asset._ref as string) as string})`,
          }}
          className={`flex flex-col items-center justify-center h-full  w-full bg-cover bg-center bg-no-repeat  `}
        >
          <Image src={logo} alt="Nerdelandslaget" width={250} height={250} priority />
          <h2 className={`${LifeCraft.className} text-8xl text-white `}>sesong 2</h2>
          <p className="text-center  font-medium text-white ">
            Vi er tilbake for sesong 2 av Mythic Trials arrangert av Nerdelandslaget WoW.{' '}
          </p>
          <div className="flex gap-4 mt-10 pb-10 ">
            <Link href="/rules">
              <button className="bg-white rounded-xl text-black border-2 border-[#FDB202] px-3 py-3  transition translate duration-500 hover:scale-105 min-w-44 md:min-w-52 min-h-10 ">
                Hvem kan være med?
              </button>
            </Link>
            {/* <Link href="/signup" prefetch>
              <button className="  min-h-10 px-4 py-3.5 rounded-xl dark:bg-[#FDB202]  bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-36 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white transition translate duration-500 hover:scale-105">
                Påmelding
              </button>
            </Link> */}
          </div>
        </div>
        <div className="gap-4 p-2 flex flex-wrap justify-center text-center ">
          {rounds.map((round, index) => {
            if (round.round === 'Semi-finaler' || round.round === 'Finale') {
              return (
                <div
                  key={index}
                  className={`flex flex-row items-center bg-[#021F33] rounded-lg mt-2 lg:mt-6 p-2 lg:p-6 w-40 lg:w-52 ${round.date > new Date().getTime() ? 'opacity-100' : 'opacity-50'}`}
                >
                  <div className="text-center flex border-r-2 border-white flex-col mr-4">
                    <div className="flex flex-col mr-4 ml-3 ">
                      <span className="font-bold text-2xl"> {round.day}</span>
                      <span className=" text-[#FDB202] font-bold text-xl lg:text-2xl">{round.month}</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold">{round.round}</div>
                </div>
              )
            }
            return (
              <div
                key={index}
                className={`flex lg:flex-row flex-col items-center bg-[#021F33] rounded-lg mt-2 lg:mt-6  p-2 lg:p-6 lg:w-56 w-24 ${round.date > new Date().getTime() ? 'opacity-100' : 'opacity-50'}`}
              >
                <div className="text-center flex lg:border-r-2 border-white flex-col mr-4">
                  <div className="flex flex-col lg:mr-4 ml-4 ">
                    <span className="font-bold text-2xl"> {round.day}</span>
                    <span className=" text-[#FDB202] font-bold text-xl lg:text-2xl">{round.month}</span>
                  </div>
                </div>
                <div className="text-lg font-bold border-t-2 lg:border-t-0">{round.round}</div>
              </div>
            )
          })}
        </div>
        {allTeams && allTeams.some((e) => e.teamName) ? (
          <div id="teams" className="  mt-12 bg-[#000F1A] w-full pt-20 pb-20 pr-4 pl-4  ">
            <h3 className={`${LifeCraft.className} text-5xl text-white mb-10 text-center `}>Lagene</h3>
            <div className="hidden md:grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 gap-2 max-w-[1400px] m-auto ">
              {allTeams &&
                allTeams
                  .slice() // Create a shallow copy of the array to avoid mutating the original array
                  .sort(() => Math.random() - 0.5) // Shuffle the array randomly
                  .map((team, index) => (
                    <React.Fragment key={team._id}>
                      {index < 5 ? (
                        <Link
                          className="rounded-md mt-4 transition translate duration-500 hover:scale-105 max-w-80 "
                          prefetch={true}
                          href={`/team/${team.teamSlug}`}
                        >
                          <TeamCard key={team._id} team={team} />
                        </Link>
                      ) : null}
                    </React.Fragment>
                  ))}
            </div>

            <div className="flex flex-wrap md:hidden  ">
              {allTeams &&
                allTeams
                  .slice() // Create a shallow copy of the array to avoid mutating the original array
                  .sort(() => Math.random() - 0.5) // Shuffle the array randomly
                  .map((team, index) => (
                    <React.Fragment key={team._id}>
                      {index < 3 && ( // Show only the first 3 teams on small screens
                        <Link
                          className="rounded-md mt-4 transition translate duration-500 hover:scale-105 w-full lg:w-1/4 md:max-w-72 md:mr-4"
                          prefetch={true}
                          href={`/team/${team.teamSlug}`}
                        >
                          <TeamCard key={team._id} team={team} />
                        </Link>
                      )}
                    </React.Fragment>
                  ))}
            </div>
            <div className="flex  w-full justify-center p-2   mt-12">
              <Link href="/teams">
                <button className="bg-[#FFFFFF] border-2 border-[#028AFD] rounded-full text-black w-32 h-8 min-w-48 font-bold min-h-10 ">
                  Se alle lagene
                </button>
              </Link>
            </div>
          </div>
        ) : null}
        {frontpageNews &&
          frontpageNews.map((news, index) => {
            const isEvenIndex = index % 2 === 0
            if (news.showOnFrontpage === false) return null
            return (
              <div
                key={news._id}
                className={`flex flex-col lg:flex-row max-w-7xl lg:mt-32 mt-6 gap-10 p-4 ${!isEvenIndex ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="lg:w-1/2 w-full">
                  <h3 className="lg:text-4xl text-3xl mb-6 font-bold text-white">{news.headline}</h3>
                  <div className="portableText-frontpage">
                    <PortableText value={news.content} />
                  </div>
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
        {showLeaderboard ? (
          <div className="mt-10 md:mt-24 lg:mt-24 m-auto flex justify-center flex-col items-center bg-[#000F1A] w-full p-20">
            <h3 className={`font-bold text-2xl md:text-5xl text-white  `}>Turneringen er i gang</h3>
            <SimplifiedLeaderboard />
            <Link href="/leaderboard" prefetch>
              <button
                className="font-extrabold w-40 transition transform hover:scale-105 duration-500 min-h-12  rounded-full mt-4 text-white hover:bg-white "
                style={{
                  background: 'linear-gradient(181.7deg, #028AFD 28.95%, #106ABC 98.56%)',
                  padding: '8px 20px',
                  boxShadow: '0px 2px 4px 0px #00000040',
                }}
              >
                Se resultater
              </button>
            </Link>
          </div>
        ) : null}{' '}
      </div>
      {/* <div className="flex items-center w-7xl justify-center gap-4 mt-10 p-20">
        <div className="bg-[#D9D9D9] h-16 w-48 grid place-items-center text-black font-bold">Sponsor 1 (Ims)</div>
        <div className="bg-[#D9D9D9] h-16 w-48 grid place-items-center text-black font-bold">Sponsor 2 (Ims)</div>
        <div className="bg-[#D9D9D9] h-16 w-48 grid place-items-center text-black font-bold">Sponsor 3 (Ims)</div>
      </div> */}
    </main>
  )
}

export default Home

const rounds = [
  {
    day: '02',
    month: 'APR',
    round: 'Runde 1',
    date: new Date('2024-04-02').getTime(),
  },
  {
    day: '04',
    month: 'APR',
    round: 'Runde 2',
    date: new Date('2024-04-04').getTime(),
  },
  {
    day: '09',
    month: 'APR',
    round: 'Runde 3',
    date: new Date('2024-04-09').getTime(),
  },
  {
    day: '11',
    month: 'APR',
    round: 'Runde 4',
    date: new Date('2024-04-11').getTime(),
  },
  {
    day: '16',
    month: 'APR',
    round: 'Runde 5',
    date: new Date('2024-04-16').getTime(),
  },
  {
    day: '18',
    month: 'APR',
    round: 'Runde 6',
    date: new Date('2024-04-18').getTime(),
  },
  {
    day: '22',
    month: 'APR',
    round: 'Semi-finaler',
    date: new Date('2024-04-22').getTime(),
  },
  {
    day: '23',
    month: 'APR',
    round: 'Finale',
    date: new Date('2024-04-23').getTime(),
  },
]
