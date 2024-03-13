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
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
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
          className={`flex flex-col items-center justify-center h-svh lg:h-[calc(100svh-290px)]  w-full bg-cover bg-center bg-no-repeat  `}
        >
          <Image src={logo} alt="Nerdelandslaget" width={250} height={250} priority className=" -mb-7 -mt-16" />
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
        <div className="gap-8 p-4 flex flex-wrap ">
          {rounds.map((round, index) => {
            return (
              <div
                key={index}
                className="flex items-center bg-[#021F33] rounded-lg mt-6 p-6 pr-6 pb-6 pl-6 lg:w-52 w-full"
              >
                <div className="text-center flex border-r-2 border-white flex-col mr-4">
                  <div className="flex flex-col mr-4">
                    <span className="font-bold text-2xl"> {round.day}</span>
                    <span className=" text-[#FDB202] font-bold text-2xl">{round.month}</span>
                  </div>
                </div>
                <div className=" text-lg font-bold">{round.round}</div>
              </div>
            )
          })}
        </div>

        <div
          id="teams"
          className=" bg-[#000F1A] p-20 mt-8 flex flex-col antialiased items-center justify-center relative overflow-hidden w-full"
        >
          <h3 className={`${LifeCraft.className} text-5xl text-white mb-4 `}>Lagene</h3>
          <InfiniteMovingCards teams={allTeams} direction="right" speed="normal" />
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

        <div className="mt-10 md:mt-24 lg:mt-24 m-auto flex justify-center flex-col items-center bg-[#000F1A] w-full p-20">
          <h3 className={`${LifeCraft.className} text-5xl text-white mb-10 `}>Turneringen er i gang</h3>
          <LeaderboardDrawer />
        </div>
      </div>
      <div className="flex items-center w-7xl justify-center gap-4 mt-10 p-20">
        <div className="bg-[#D9D9D9] h-16 w-48 grid place-items-center text-black font-bold">Sponsor 1 (Ims)</div>
        <div className="bg-[#D9D9D9] h-16 w-48 grid place-items-center text-black font-bold">Sponsor 2 (Ims)</div>
        <div className="bg-[#D9D9D9] h-16 w-48 grid place-items-center text-black font-bold">Sponsor 3 (Ims)</div>
      </div>
    </main>
  )
}

export default Home

const rounds = [
  {
    day: '02',
    month: 'APR',
    round: 'Runde 1',
  },
  {
    day: '09',
    month: 'APR',
    round: 'Runde 2',
  },
  {
    day: '16',
    month: 'APR',
    round: 'Runde 3',
  },
  {
    day: '23',
    month: 'APR',
    round: 'Runde 4',
  },
  {
    day: '30',
    month: 'APR',
    round: 'Runde 5',
  },
  {
    day: '07',
    month: 'MAI',
    round: 'Runde 6',
  },
  {
    day: '14',
    month: 'MAI',
    round: 'Semi-finaler',
  },
  {
    day: '21',
    month: 'MAI',
    round: 'FINALE',
  },
]

const testimonials = [
  {
    quote:
      'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.',
    name: 'Charles Dickens',
    title: 'A Tale of Two Cities',
  },
  {
    quote:
      "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
    name: 'William Shakespeare',
    title: 'Hamlet',
  },
  {
    quote: 'All that we see or seem is but a dream within a dream.',
    name: 'Edgar Allan Poe',
    title: 'A Dream Within a Dream',
  },
  {
    quote:
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    name: 'Jane Austen',
    title: 'Pride and Prejudice',
  },
  {
    quote:
      'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
    name: 'Herman Melville',
    title: 'Moby-Dick',
  },
]
