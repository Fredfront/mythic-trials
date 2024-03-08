import Link from 'next/link'
import NavBar from './components/Navbar'
import Image from 'next/image'
import { DiscordLogoIcon, InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons'
import { TwitchIcon, Youtube } from 'lucide-react'
import { get } from '@vercel/edge-config'

export default async function Template({ children }: { children: React.ReactNode }) {
  const showLeaderboard = (await get('showLeaderboard')) as any

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  )
}

const Footer = async () => {
  const showLeaderboard = (await get('showLeaderboard')) as any

  return (
    <footer className=" mt-10  shadow dark:bg-[#272727]">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <ul className="flex gap-4 mt-4 mb-4">
            <li>
              <a href="https://discord.gg/wownl">
                <DiscordLogoIcon className=" h-5  w-5 " />
              </a>
            </li>
            <li>
              <a href="https://www.twitch.tv/nerdelandslaget_wow">
                <TwitchIcon className="   h-5 w-5" />
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/@nerdelandslagetwow">
                <Youtube className=" h-5 w-5" />
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/nerdelandslaget.wow/">
                <InstagramLogoIcon className="h-5 w-5" />{' '}
              </a>
            </li>
            <li>
              <a href="https://twitter.com/NL_Draenor/">
                <TwitterLogoIcon className="h-5 w-5" />
              </a>
            </li>
          </ul>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <Link className="hover:underline mr-4 md:mr-6" href="/">
                Forside
              </Link>
            </li>
            <li>
              <Link href="/rules" className="hover:underline mr-4 md:mr-6">
                Regler
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:underline mr-4 md:mr-6">
                Påmelding
              </Link>
            </li>
            <li>
              <Link href="/#teams" className="hover:underline mr-4 md:mr-6">
                Lag
              </Link>
            </li>
            <li>
              {showLeaderboard === true ? (
                <Link href="/leaderboard" className="hover:underline me-4 md:me-6">
                  Leaderboard
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
