'use client'
import Link from 'next/link'
import React from 'react'

const Navbar = ({ showLeaderboard }: { showLeaderboard: boolean }) => {
  return (
    <nav className="flex items-center justify-between flex-wrap bg-black p-6 ">
      <div className=" flex-grow flex items-center w-auto">
        <div className="flex-grow text-xs ">
          <Link href="/" className="inline-block mt-0   text-primary  hover:text-white mr-2">
            Forside
          </Link>
          <Link href="/#teams" className="inline-block mt-0   text-primary  hover:text-white mr-2">
            Lag
          </Link>
          {showLeaderboard === true ? (
            <Link href="/leaderboard" className="mt-0 inline-block  text-primary   hover:text-white mr-2">
              Leaderboard
            </Link>
          ) : null}

          <Link href="/rules" className=" inline-block mt-0 text-primary  hover:text-white">
            Regler
          </Link>
        </div>
        <div>
          <Link
            href="/signup"
            className="inline-block text-xs px-2 py-2 leading-none border rounded  text-primary  mt-0"
          >
            Påmelding
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
