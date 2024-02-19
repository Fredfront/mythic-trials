'use client'
import React, { useEffect, useState } from 'react'
import { GiHamburgerMenu } from 'react-icons/gi'
import Link from 'next/link'
import { ModeToggle } from './toggle'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navList = [
    {
      icon: undefined,
      title: 'Lag',
      href: '/',
    },
    {
      icon: undefined,
      title: 'Leaderboard',
      href: '/leaderboard',
    },
    {
      icon: undefined,
      title: 'Regler',
      href: '/rules',
    },
    {
      icon: undefined,
      title: 'Info',
      href: '/info',
    },
    {
      icon: undefined,
      title: 'Påmelding',
      href: '/signup',
    },
  ]

  const handleDrawer = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleEscKeyPress = (e: { keyCode: number }) => {
      if (e.keyCode === 27 && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.body.style.setProperty('overflow', 'hidden')
    } else {
      document.body.style.removeProperty('overflow')
    }

    document.addEventListener('keydown', handleEscKeyPress)

    return () => {
      document.removeEventListener('keydown', handleEscKeyPress)
    }
  }, [isOpen])

  return (
    <nav className="flex  w-full items-center justify-between px-6 h-16  z-10">
      <div className="flex items-center">
        <button className="lg:hidden mr-2" aria-label="Open Menu" onClick={handleDrawer}>
          <GiHamburgerMenu className="text-3xl" />
        </button>

        <Link href="/">
          <span style={{ fontWeight: 'bold' }}>Mythic Trials</span>
        </Link>
      </div>

      <div className="flex items-center lg:block md:hidden">
        <div className="hidden md:flex md:justify-between md:bg-transparent">
          {navList.map(({ icon, title, href }, index) => {
            return (
              <button
                key={index}
                title="Wishlist"
                className="flex items-center p-3 font-medium mr-2 text-center  focus:outline-none focus:bg-gray-400"
              >
                <Link href={href}>
                  <span>{icon}</span>
                  <span>{title}</span>
                </Link>
              </button>
            )
          })}
          <div className="mt-1">
            <ModeToggle />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="z-10 fixed inset-0 transition-opacity">
          <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black opacity-50" tabIndex={0}></div>
        </div>
      )}

      <aside
        className={`transform top-0 left-0 w-64  fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <span className="flex w-full items-center p-4 border-b">
          <h3 className="h-auto w-32 mx-auto font-bold">Mythic Trials</h3>
        </span>
        {navList.map(({ icon, title }, index) => {
          return (
            <span key={index} className="flex items-center p-4 hover:bg-pink-500 hover:text-white ">
              <span className="mr-2">{icon}</span> <span>{title}</span>
            </span>
          )
        })}
      </aside>
    </nav>
  )
}

export default Navbar
