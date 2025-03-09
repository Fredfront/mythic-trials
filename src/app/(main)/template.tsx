import Link from 'next/link'
import { DiscordLogoIcon, InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons'
import { TwitchIcon, Youtube } from 'lucide-react'
import { getShowLeaderboard } from '../api/featureToggle/getShowLeaderboard'
import { getAllTeams } from '../api/getAllTeams'
import NavBarV2 from '@/components/navbar'
import { ServerClient } from '@/utils/supabase/server'
import { MatchRecord, SupabaseTeamType } from '../../../types'
import { Toaster } from '@/components/ui/toaster'
import MatchDataProvider from '@/context/MatchContext'

export default async function Template({ children }: { children: React.ReactNode }) {
  const teams = (await ServerClient.from('teams').select('*')).data as SupabaseTeamType[]
  const sanityTeams = await getAllTeams()
  const matches = (await ServerClient.from('matches').select('*')).data as MatchRecord[]
  const featureFlags = (await ServerClient.from('feature_flags').select('*')).data as {
    create_team_allowed: boolean
    edit_team_allowed: boolean
    login_allowed: boolean
    hide_teams: boolean
  }[]

  return (
    <div className="flex flex-col min-h-screen">
      <NavBarV2 sanityTeams={sanityTeams} teams={teams} matches={matches} featureFlags={featureFlags} />
      <MatchDataProvider>
        <div className="grow">{children}</div>
      </MatchDataProvider>
      <Toaster />
      <Footer />
    </div>
  )
}

const Footer = async () => {
  const showLeaderboardData = await getShowLeaderboard()
  const showLeaderboard = showLeaderboardData && showLeaderboardData[0] && showLeaderboardData?.[0]?.enabled

  return (
    <footer className="  shadow-sm bg-gray-800 border-t-4 border-gradient">
      <div className="w-full max-w-(--breakpoint-xl) mx-auto p-4 md:py-8">
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
            <li className="transition transform hover:scale-105 duration-500 ">
              <Link
                href="/handbook"
                className="hover:underline mr-4 md:mr-6 transition transform hover:scale-105 duration-500 "
              >
                Handbook
              </Link>
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
