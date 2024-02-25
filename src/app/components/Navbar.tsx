'use client'
import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between flex-wrap bg-black p-6">
      <div className=" flex-grow flex items-center w-auto">
        <div className="text-sm flex-grow">
          <Link href="/#teams" className="inline-block mt-0  hover:text-white mr-4">
            Lag
          </Link>
          <Link href="/leaderboard" className="mt-0 inline-block  hover:text-white mr-4">
            Leaderboard
          </Link>
          <Link href="/rules" className=" inline-block mt-0  hover:text-white">
            Regler
          </Link>
        </div>
        <div>
          <Link
            href="/signup"
            className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent  hover:bg-white mt-0"
          >
            Påmelding
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
