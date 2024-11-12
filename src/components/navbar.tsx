'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import { Menu, X, User, LogOut, Edit, Gamepad, Users, Bug } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import supabase from '@/utils/supabase/client'
import { useGetUserData } from '@/app/auth/useGetUserData'
import { MatchRecord, SupabaseTeamType } from '../../types'
import { MythicPlusTeam } from '@/app/api/getAllTeams'

const NavBar = ({
  teams,
  sanityTeams,
  matches,
  featureFlags,
}: {
  teams?: SupabaseTeamType[]
  sanityTeams: MythicPlusTeam[]
  matches: MatchRecord[]
  featureFlags?: {
    create_team_allowed: boolean
    edit_team_allowed: boolean
    login_allowed: boolean
    hide_teams: boolean
  }[]
}) =>
{
  const showTeams = featureFlags?.find((e) => e.hide_teams === false)
  const createTeamAllowed = featureFlags?.find((e) => e.create_team_allowed === true)
  const editTeamAllowed = featureFlags?.find((e) => e.edit_team_allowed === true)
  const loginAllowed = featureFlags?.find((e) => e.login_allowed === true)

  const [ isMenuOpen, setMenuOpen ] = useState(false)
  const { user, loading } = useGetUserData()
  const pathname = usePathname()
  const router = useRouter()
  const team = teams?.find((e) => e.contact_person === user?.data.user?.email)
  const mySanityTeam = sanityTeams?.find((e) => e.contactPerson === user?.data.user?.email)
  const [ myTeam, setMyTeam ] = useState<SupabaseTeamType | undefined>(team)


  useEffect(() =>
  {
    if (team && !myTeam) {
      setMyTeam(team)
    }
  }, [ team, myTeam ])

  const updateTeam = useCallback(async () =>
  {
    if (team?.approved_in_sanity === true || !mySanityTeam || !team || loading) return
    if (team?.approved_in_sanity === false && mySanityTeam) {
      await supabase.from('teams').update({ approved_in_sanity: true }).eq('id', team.id)
    }
  }, [ mySanityTeam, team, loading ])

  useEffect(() =>
  {
    updateTeam()
  }, [ mySanityTeam, team, loading, updateTeam ])

  const toggleMenu = () =>
  {
    setMenuOpen(!isMenuOpen)
  }

  const handleLogout = async () =>
  {
    await supabase.auth.signOut().then(() =>
    {
      localStorage.removeItem('user')
      router.push('/')
      window.location.reload()
    })
  }

  // Check if the current user is a superadmin

  useEffect(() =>
  {
    if (!user?.data.user?.email) return

    const channel = supabase
      .channel('pick_ban')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
        },
        (payload) =>
        {
          const newPayload = payload.new as SupabaseTeamType

          if (newPayload.contact_person === user?.data.user?.email) {
            setMyTeam(newPayload)
          }
        },
      )
      .subscribe()

    return () =>
    {
      supabase.removeChannel(channel)
    }
  }, [ user?.data.user?.email ])

  const navLinks = [
    { href: '/', label: 'Hovedside' },
    { href: '/turnering', label: 'Turnering' },
    { href: '/contact', label: 'Kontakt' },
  ]

  return (
    <nav className="bg-[#011624] items-center flex border-b-4 border-gradient h-[110px] ">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center flex-shrink-0 text-white">
          <Image className='h-[108px] w-[78px]' width={78} height={108} src="/MT_logo_white.webp" alt="Mythic Trials Sesong 2 Logo" />
        </Link>

        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-gray-200 hover:text-white font-bold transition-colors duration-200 ${pathname === link.href ? 'text-yellow-500' : ''
                }`}
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
                        <AvatarImage
                          src={user.data.user?.user_metadata?.avatar_url}
                          alt={user.data.user?.email || ''}
                        />
                        <AvatarFallback>{user.data.user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 text-white" align="end" forceMount>
                    {mySanityTeam && showTeams && matches && matches.length > 0 && (
                      <DropdownMenuItem asChild>
                        <Link href="/my-matches">
                          <Gamepad /> Mine kamper
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {editTeamAllowed && myTeam && (
                      <DropdownMenuItem asChild>
                        <Link href={`/min-side`}>
                          <User /> Min side
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href="/bug-report">
                        <Bug /> Rapporter bug
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logg ut</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : loginAllowed ? (
                <Button
                  variant="outline"
                  className="hidden lg:flex bg-[#011624] text-white"
                  onClick={async () =>
                    supabase.auth.signInWithOAuth({
                      provider: 'discord',
                      options: {
                        redirectTo: `${window.location.origin}/`,
                      },
                    })
                  }
                >
                  <User className="mr-2 h-4 w-4" /> Logg inn
                </Button>
              ) : null}
            </>
          )}

          {createTeamAllowed && !myTeam && !loading && (
            <Link href="/signup" prefetch>
              <Button className="bg-gradient-to-b rounded-3xl from-yellow-400 via-yellow-500 to-orange-600 text-white font-bold hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600  h-[40px]">
                Påmelding
              </Button>
            </Link>
          )}

          <Button variant="ghost" className="lg:hidden text-white" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
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

            {createTeamAllowed && !myTeam && (
              <Link href="/signup" prefetch onClick={toggleMenu}>
                <Button className="mt-4 px-6 py-3 bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 text-white font-bold text-xl hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600">
                  Påmelding
                </Button>
              </Link>
            )}
            {!user?.data.user?.email && loginAllowed && (
              <Button
                variant="outline"
                className="bg-[#011624] text-white mt-4 px-6 py-3"
                onClick={() =>
                  supabase.auth.signInWithOAuth({
                    provider: 'discord',
                    options: {
                      redirectTo: `${window.location.origin}/`,
                    },
                  })
                }
              >
                <User className="mr-2 h-4 w-4" /> Logg inn
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar
