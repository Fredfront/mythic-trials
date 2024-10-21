import Link from 'next/link'
import { DiscordLogoIcon, InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons'
import { TwitchIcon, Youtube } from 'lucide-react'
import { getShowLeaderboard } from '../api/featureToggle/getShowLeaderboard'
import { getAllTeams } from '../api/getAllTeams'
import NavBarV2 from '@/components/navbar'

export default async function Template({ children }: { children: React.ReactNode })
{
  const sanityTeams = await getAllTeams()
  return (
    <div className="flex flex-col min-h-screen">
      <NavBarV2 sanityTeams={sanityTeams} />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  )
}

const Footer = async () =>
{
  const showLeaderboardData = await getShowLeaderboard()
  const showLeaderboard = showLeaderboardData?.[ 0 ].enabled

  return (
    <footer className="  shadow bg-[#272727]">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <ul className="flex gap-4 mt-4 mb-4">
            <li>
              <a href="https://discord.gg/wownl">
                <DiscordLogoIcon className="text-white  h-5  w-5 transition transform hover:scale-105 duration-500  " />
              </a>
            </li>
            <li>
              <a href="https://www.twitch.tv/nerdelandslaget_wow">
                <TwitchIcon className="text-white h-5 w-5 transition transform hover:scale-105 duration-500 " />
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/@nerdelandslagetwow">
                <Youtube className=" text-white h-5 w-5 transition transform hover:scale-105 duration-500 " />
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/nerdelandslaget.wow/">
                <InstagramLogoIcon className="text-white h-5 w-5 transition transform hover:scale-105 duration-500 " />{' '}
              </a>
            </li>
            <li>
              <a href="https://twitter.com/NL_Draenor/">
                <TwitterLogoIcon className="text-white h-5 w-5 transition transform hover:scale-105 duration-500 " />
              </a>
            </li>
          </ul>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li className="transition transform hover:scale-105 duration-500 ">
              <Link className="hover:underline mr-4 md:mr-6 " href="/">
                Hovedside
              </Link>
            </li>
            <li className="transition transform hover:scale-105 duration-500 ">
              <Link
                href="/rules"
                className="hover:underline mr-4 md:mr-6 transition transform hover:scale-105 duration-500 "
              >
                Regler
              </Link>
            </li>
            <li className="transition transform hover:scale-105 duration-500 ">
              <Link
                href="/signup"
                className="hover:underline mr-4 md:mr-6 transition transform hover:scale-105 duration-500 "
              >
                Påmelding
              </Link>
            </li>
            <li className="transition transform hover:scale-105 duration-500 ">
              <Link
                href="/teams"
                className="hover:underline mr-4 md:mr-6 transition transform hover:scale-105 duration-500 "
              >
                Lagene
              </Link>
            </li>
            <li className="transition transform hover:scale-105 duration-500 ">
              {showLeaderboard === true ? (
                <Link
                  href="/leaderboard"
                  className="hover:underline me-4 md:me-6 transition transform hover:scale-105 duration-500 "
                >
                  Resultater
                </Link>
              ) : null}
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © {new Date().getFullYear()}{' '}
          <a href="https://nl-wow.no/" className="hover:underline">
            Nerdelandslaget WoW Team
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  )
}
