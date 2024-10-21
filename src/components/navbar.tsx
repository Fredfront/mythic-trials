'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import supabase from '@/utils/supabase/client'
import { UserResponse } from '@supabase/supabase-js'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { useGetUserData } from '@/app/auth/useGetUserData'

const NavBar = ({ sanityTeams }: { sanityTeams: MythicPlusTeam[] }) =>
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

  const handleLogout = async () =>
  {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/', label: 'Hovedside' },
    { href: '/turnering', label: 'Turnering' },
    { href: '/contact', label: 'Kontakt' },
  ]

  console.log(pathname)

  return (
    <nav className="bg-[#011624] p-4 border-b-4 border-gradient">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center flex-shrink-0 text-white">
          <Image width={45} height={45} src="/MT_logo_white.webp" alt="Mythic Trials Sesong 2 Logo" />
        </Link>

        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-gray-200 hover:text-white font-bold transition-colors duration-200 ${pathname === link.href ? 'text-yellow-500' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {user?.data.user?.email ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.data.user?.user_metadata?.avatar_url} alt={user.data.user?.email || ''} />
                        <AvatarFallback>{user.data.user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/my-matches">Mine kamper</Link>
                    </DropdownMenuItem>
                    {team && (
                      <DropdownMenuItem asChild>
                        <Link href={`/signup/existingTeam/${team.teamSlug}`}>Mitt lag</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logg ut</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord' })}
                >
                  <User className="mr-2 h-4 w-4" /> Logg inn
                </Button>
              )}
            </>
          )}

          {!team && !loading && (
            <Link href="/signup" prefetch>
              <Button className="bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 text-white font-bold hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600">
                Påmelding
              </Button>
            </Link>
          )}

          <Button variant="ghost" className="lg:hidden text-white" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-[#011624] p-4">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={toggleMenu}>
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center flex-grow space-y-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-2xl ${pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                  ? 'text-[#FDB202]'
                  : 'text-gray-200'
                  } hover:text-white font-bold`}
                onClick={toggleMenu}
              >
                {link.label}
              </Link>
            ))}
            {!team && (
              <Link href="/signup" prefetch onClick={toggleMenu}>
                <Button className="mt-4 px-6 py-3 bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 text-white font-bold text-xl hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600">
                  Påmelding
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar