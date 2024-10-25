'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/loading'
import { useGetUserData } from '@/app/auth/useGetUserData'
import { MythicPlusTeam, getAllTeams } from '@/app/api/getAllTeams'
import { SupabaseTeamType } from '../../../../../../types'
import { AnimatedTooltip } from '@/app/components/AnimatedTooltip'
import { ServerClient } from '@/utils/supabase/server'

function ExistingTeam() {
  const { user, loading: userLoading } = useGetUserData()
  const [supabaseTeams, setSupabaseTeams] = useState<SupabaseTeamType[] | null>(null)
  const [allTeams, setAllTeams] = useState<MythicPlusTeam[] | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    async function fetchAllTeams() {
      try {
        const data = await getAllTeams()
        const res = await ServerClient.from('teams').select('*')
        setSupabaseTeams(res.data as SupabaseTeamType[])
        setAllTeams(data)
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllTeams()
  }, [])

  const team = useMemo(
    () => allTeams?.find((e) => e.contactPerson === user?.data.user?.email),
    [allTeams, user?.data.user?.email],
  )

  useEffect(() => {
    if (userLoading || loading) return

    if (!user?.data.user?.email) {
      // router.push('/signup/signin')
    } else if (team) {
      router.push(`/signup/existingTeam/${team.teamSlug}`)
    }
  }, [userLoading, loading, user?.data.user?.email, team, router])

  const mappedTeam = team?.players.map((player) => ({
    id: player.characterName,
    characterName: player.characterName,
    realmName: player.realmName,
  }))

  const mappedAlts = team?.players
    .flatMap((player) => player.alts || [])
    .map((alt) => ({
      id: alt.altCharacterName,
      characterName: alt.altCharacterName,
      realmName: alt.altRealmName,
    }))

  const hasAltCharacters = team?.players.some((player) => player.alts && player.alts.length > 0)

  if (userLoading || loading) {
    return (
      <div className="w-full grid place-content-center items-center h-screen">
        <div className="flex">
          Henter laginfo... <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" />
        </div>
      </div>
    )
  }

  if (user?.data.user?.email === undefined) {
    return (
      <div className="flex items-center m-auto w-full justify-center mt-10">
        <h1 className="text-2xl font-bold mb-4">Du må være logget inn for å se denne siden.</h1>
      </div>
    )
  }

  if (supabaseTeams?.find((e) => e.contact_person === user?.data.user?.email)?.approved_in_sanity === false) {
    const teamName = supabaseTeams.find((e) => e.contact_person === user?.data.user?.email)?.name
    return (
      <div className="flex items-center m-auto w-full justify-center mt-10">
        <h1 className="text-2xl font-bold mb-4">Laget ditt ({teamName}) er registrert men venter på godkjenning.</h1>
      </div>
    )
  }

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="flex flex-col items-center">
          <h1 className="p-6 text-center text-2xl md:text-3xl font-bold mb-4">Du har allerede opprettet et lag</h1>
          <p className="p-6 text-center mb-10">NB! Det kan ta noen minutter før endringene er synlig på denne siden.</p>
          <h1 className="text-2xl font-bold mb-4">{team?.teamName}</h1>
          <h2>Main characters</h2>

          <div className="flex flex-row items-center justify-center mb-10 w-full">
            <AnimatedTooltip items={mappedTeam as any} />
          </div>

          {hasAltCharacters && (
            <>
              <h2>Alt characters</h2>
              <div className="flex flex-row items-center justify-center mb-10 w-full">
                <AnimatedTooltip items={mappedAlts?.[0] as any} />
              </div>
            </>
          )}

          <Link href={`/signup/editTeam/${team?.teamSlug}`}>
            <Button
              onClick={() => {
                setLoading(true)
              }}
              className="mt-10 mb-8 inline-block text-xs px-2 py-2 leading-none rounded-xl bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-32 text-center font-bold text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white"
            >
              Legg til eller fjern spillere
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default ExistingTeam
