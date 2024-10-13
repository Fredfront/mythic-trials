'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { RxHamburgerMenu } from 'react-icons/rx'
import { AiOutlineClose } from 'react-icons/ai'
import { usePathname, useRouter } from 'next/navigation'
import { useGetUserData } from '../auth/useGetUserData'
import supabase from '@/utils/supabase/client'
import { LogOut, User } from 'lucide-react'
import { MythicPlusTeam } from '../api/getAllTeams'
import { UserResponse } from '@supabase/supabase-js'

const NavBar = ({ showLeaderboard, sanityTeams }: { showLeaderboard: boolean; sanityTeams: MythicPlusTeam[] }) =>
{
  const [ isMenuOpen, setMenuOpen ] = useState(false)
  const { user, loading } = useGetUserData()
  const pathname = usePathname()
  const router = useRouter()

  const team = sanityTeams.find((e) => e.contactPerson === user?.data.user?.email)

  const toggleMenu = () =>
  {
    setMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <nav className="bg-[#011624] p-4 border-b-4 border-gradient">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-shrink-0 text-white mr-auto">
            <Link href="/">
              <Image width={45} height={45} src="/MT_logo_white.webp" alt="Mythic Trials Sesong 2 Logo" />
            </Link>
          </div>

          {!loading && !user?.data.user?.email ? (
            <div
              onClick={() =>
              {
                supabase.auth.signInWithOAuth({
                  provider: 'discord',
                })
              }}
            >
              Logg inn
            </div>
          ) : null}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1  ">
            {/* Navigation links for large screens */}
            <Link
              href="/"
              className={
                pathname === '/'
                  ? 'text-[#FDB202] hover:text-white mx-4 font-bold cursor-pointer'
                  : 'text-gray-200 hover:text-white mx-4 font-bold cursor-pointer'
              }
            >
              Hovedside
            </Link>

            <Link
              href="/turnering"
              className={
                pathname.includes('/turnering')
                  ? 'text-[#FDB202] hover:text-white mx-4 font-bold cursor-pointer'
                  : 'text-gray-200 hover:text-white mx-4 font-bold cursor-pointer'
              }
            >
              Turnering
            </Link>

            <Link
              href="/contact"
              className={
                pathname === '/contact'
                  ? 'text-[#FDB202] hover:text-white mx-4 font-bold cursor-pointer'
                  : 'text-gray-200 hover:text-white mx-4 font-bold cursor-pointer'
              }
            >
              Kontakt
            </Link>
          </div>
          <div className="flex  items-center">
            {!team && <Link href="/signup" prefetch>
              <Button className="hidden lg:inline-block mr-4 px-2 py-2 leading-none rounded-xl mt-0 bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-32 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white">
                Påmelding
              </Button>
            </Link>}
            <div className="block lg:hidden">
              {/* Hamburger icon for mobile */}
              <button
                className="flex items-center px-3 py-2 text-gray-200 border-gray-400 hover:text-white hover:border-white transition-all duration-300"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <AiOutlineClose className="text-4xl transform rotate-0 duration-200" />
                ) : (
                  <RxHamburgerMenu className="text-4xl transform rotate-0 duration-200" />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Navigation links for small screens */}
        <div
          className={`lg:hidden mt-4 ${isMenuOpen ? 'flex translate transition-all duration-500 ease-in-out' : 'hidden'} text-center min-h-screen justify-center text-2xl  `}
        >
          <div className="flex flex-col gap-8 text-left mt-10 ">
            <Link
              href="/"
              className={
                pathname === '/'
                  ? 'text-[#FDB202] hover:text-white mx-4 font-bold'
                  : 'text-gray-200 hover:text-white mx-4 font-bold'
              }
            >
              Hovedside
            </Link>

            <Link
              href="/contact"
              className={
                pathname === '/contact'
                  ? 'text-[#FDB202] hover:text-white mx-4 font-bold'
                  : 'text-gray-200 hover:text-white mx-4 font-bold'
              }
            >
              Kontakt
            </Link>
            <Link href="/signup" prefetch>
              <Button className="inline-block ml-4 mr-4 px-2 py-2 leading-none rounded-xl mt-0 bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-32 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white">
                Påmelding
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      {team && user ? <LoggedInNavBar user={user} teamSlug={team.teamSlug} /> : null}
    </>
  )
}

export default NavBar

const LoggedInNavBar = ({ user, teamSlug }: { user: UserResponse; teamSlug: string }) =>
{
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="md:flex  bg-[#112b3c] p-2 ">
      <div className="flex gap-2">
        <User />
        {user?.data.user?.email}
      </div>
      <div className="m-auto hover:cursor-pointer hover:font-bold">
        {' '}
        <Link
          href="/my-matches"
          className={
            pathname === '/my-matches'
              ? 'text-[#FDB202] hover:text-white mx-4 font-bold cursor-pointer'
              : 'text-gray-200 hover:text-white mx-4 font-bold cursor-pointer'
          }
        >
          Mine kamper
        </Link>
      </div>
      <div className="m-auto hover:cursor-pointer hover:font-bold">
        <Link
          href={`/signup/existingTeam/${teamSlug}`}
          className={
            pathname === '/my-matches'
              ? 'text-[#FDB202] hover:text-white mx-4 font-bold cursor-pointer'
              : 'text-gray-200 hover:text-white mx-4 font-bold cursor-pointer'
          }
        >
          Mitt lag
        </Link>
      </div>
      <div
        onClick={async () =>
        {
          supabase.auth.signOut().then(() =>
          {
            router.push('/')
          })
        }}
        className="flex text-right ml-auto justify-end gap-2 cursor-pointer hover:font-bold"
      >
        Logg ut <LogOut />
      </div>
    </div>
  )
}
