'use client'
import { MythicPlusTeam, getAllTeams } from '@/app/api/getAllTeams'
import { Button } from '@/components/ui/button'
import React, { useEffect, useMemo, useState } from 'react'
import { PlayerInfo } from '../../components/PlayerInfo'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Icons } from '@/components/loading'
import { useRouter } from 'next/navigation'
import { AnimatedTooltip } from '@/app/components/AnimatedTooltip'

function ExistingTeam() {
  const { data: auth } = useSession()
  const router = useRouter()
  const [allTeams, setAllTeams] = useState<MythicPlusTeam[] | null>(null)
  const [loading, setLoading] = useState(false)
  React.useEffect(() => {
    async function fetchAllTeams() {
      const data = await getAllTeams()
      setAllTeams(data)
    }
    fetchAllTeams()
  }, [])

  const teamSlug = useMemo(
    () => allTeams?.find((e) => e.contactPerson === auth?.user?.email),
    [allTeams, auth?.user?.email],
  )?.teamSlug

  useEffect(() => {
    if (allTeams?.find((e) => e.contactPerson === auth?.user?.email)) {
      router.push(`/signup/existingTeam/${teamSlug}`)
    }
  }, [allTeams, auth?.user?.email, router, teamSlug])

  const mappedTeam = allTeams
    ?.find((e) => e.contactPerson === auth?.user?.email)
    ?.players.map((player) => {
      return {
        id: player.characterName,
        characterName: player.characterName,
        realmName: player.realmName,
      }
    })

  const mappedAlts = allTeams
    ?.find((e) => e.contactPerson === auth?.user?.email)
    ?.players.map((player) => {
      return player.alts?.map((alt) => {
        return {
          id: alt.altCharacterName,
          characterName: alt.altCharacterName,
          realmName: alt.altRealmName,
        }
      })
    })
    .filter((e) => e !== undefined && e.length > 0)

  const hasAltCharacters = useMemo(
    () =>
      allTeams
        ?.find((e) => e.contactPerson === auth?.user?.email)
        ?.players.some((player) => player.alts && player.alts.length > 0),
    [allTeams, auth?.user?.email],
  )

  if (loading) {
    return (
      <div className="w-full grid place-content-center items-center h-screen">
        <div className="flex">
          Henter laginfo... <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center ">
      <div className="flex flex-col items-center">
        <h1 className="p-6 text-center text-2xl md:text-3xl font-bold font-sans mb-4">
          Du har allerede opprettet et lag
        </h1>
        <p className="p-6 text-center mb-10">NB! Det kan ta noen minutter før endringene er synlig på denne siden.</p>
        <h1 className="text-2xl font-bold mb-4">
          {allTeams?.find((e) => e.contactPerson === auth?.user?.email)?.teamName}
        </h1>
        <h2>Main characters</h2>

        <div className="flex flex-row items-center justify-center mb-10 w-full">
          <AnimatedTooltip items={mappedTeam as any} />
        </div>
        {hasAltCharacters ? (
          <>
            <h2>Alt characters</h2>
            <div className="flex flex-row items-center justify-center mb-10 w-full">
              <AnimatedTooltip items={mappedAlts?.[0] as any} />
            </div>
          </>
        ) : null}

        <Link href={`/signup/editTeam/${teamSlug}`}>
          <Button
            onClick={() => {
              setLoading(true)
            }}
            className="mt-10 mb-8"
          >
            Legg til eller fjern spillere
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ExistingTeam
