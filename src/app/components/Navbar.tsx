'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { RxHamburgerMenu } from 'react-icons/rx'
import { AiOutlineClose } from 'react-icons/ai'
import { usePathname } from 'next/navigation'

const NavBar = ({ showLeaderboard }: { showLeaderboard: boolean }) => {
  const [isMenuOpen, setMenuOpen] = useState(false)

  const pathname = usePathname()

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-[#011624] p-4 border-b-4 border-gradient">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-shrink-0 text-white mr-auto">
          <Link href="/">
            <Image width={45} height={45} src="/MT_logo_white.webp" alt="Mythic Trials Sesong 2 Logo" />
          </Link>
        </div>
        <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 ">
          {/* Navigation links for large screens */}
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
            href="/teams"
            className={
              pathname === '/teams'
                ? 'text-[#FDB202] hover:text-white mx-4 font-bold'
                : 'text-gray-200 hover:text-white mx-4 font-bold'
            }
          >
            Lagene
          </Link>
          <Link
            href="/rules"
            className={
              pathname === '/rules'
                ? 'text-[#FDB202] hover:text-white mx-4 font-bold'
                : 'text-gray-200 hover:text-white mx-4 font-bold'
            }
          >
            Regler
          </Link>
          {showLeaderboard ? (
            <Link
              href="/leaderboard"
              className={
                pathname === '/leaderboard'
                  ? 'text-[#FDB202] hover:text-white mx-4 font-bold'
                  : 'text-gray-200 hover:text-white mx-4 font-bold'
              }
            >
              Resultater
            </Link>
          ) : null}

          {/* <Link
            href="#"
            className={
              pathname === '/contact'
                ? 'text-[#FDB202] hover:text-white mx-4 font-bold'
                : 'text-gray-200 hover:text-white mx-4 font-bold'
            }
          >
            Kontakt
          </Link> */}
        </div>
        <div className="flex  items-center">
          <Link href="/signup" prefetch>
            <Button className="hidden lg:inline-block mr-4 px-2 py-2 leading-none rounded-xl mt-0 bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-32 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white">
              Påmelding
            </Button>
          </Link>
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
            href="/teams"
            className={
              pathname === '/teams'
                ? 'text-[#FDB202] hover:text-white mx-4 font-bold'
                : 'text-gray-200 hover:text-white mx-4 font-bold'
            }
          >
            Lagene
          </Link>
          <Link
            href="/rules"
            className={
              pathname === '/rules'
                ? 'text-[#FDB202] hover:text-white mx-4 font-bold'
                : 'text-gray-200 hover:text-white mx-4 font-bold'
            }
          >
            Regler
          </Link>
          {showLeaderboard ? (
            <Link
              href="/leaderboard"
              className={
                pathname === '/leaderboard'
                  ? 'text-[#FDB202] hover:text-white mx-4 font-bold'
                  : 'text-gray-200 hover:text-white mx-4 font-bold'
              }
            >
              Resultater
            </Link>
          ) : null}

          <Link href="/signup" prefetch>
            <Button className="inline-block ml-4 mr-4 px-2 py-2 leading-none rounded-xl mt-0 bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-32 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white">
              Påmelding
            </Button>
          </Link>
          {/* <Link
            href="/contact"
            className={
              pathname === '/contact'
                ? 'text-[#FDB202] hover:text-white mx-4 font-bold'
                : 'text-gray-200 hover:text-white mx-4 font-bold'
            }
          >
            6. Kontakt
          </Link> */}
        </div>
      </div>
    </nav>
  )
}

export default NavBar
