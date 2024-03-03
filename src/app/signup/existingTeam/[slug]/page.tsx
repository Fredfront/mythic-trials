'use client'
import { MythicPlusTeam, getAllTeams } from '@/app/api/getAllTeams'
import { Button } from '@/components/ui/button'
import React, { useEffect, useMemo, useState } from 'react'
import { PlayerInfo } from '../../components/PlayerInfo'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Icons } from '@/components/loading'
import { useRouter } from 'next/navigation'

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

  const hasAltCharacters = useMemo(
    () =>
      allTeams?.find((e) => e.contactPerson === auth?.user?.email)?.players.some((player) => player.alts.length > 0),
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
        <h1 className=" p-2 text-2xl md:text-3xl font-bold font-sans mb-4">Du har allerede opprettet et lag</h1>
        <p className="p-2 mb-10">NB! Det kan ta noen minutter før endringene er synlig på denne siden.</p>
        <p className="font-bold mb-4 text-xl md:text-3xl">
          Lagnavn: {allTeams?.find((e) => e.contactPerson === auth?.user?.email)?.teamName}
        </p>
        <h2 className=" text-left font-poppins font-bold">MAINS</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 place-content-center text-center ">
          {allTeams
            ?.find((e) => e.contactPerson === auth?.user?.email)
            ?.players.map((player, index) => <PlayerInfo key={index} player={player} />)}
        </div>
        {hasAltCharacters ? <h2 className=" font-poppins font-bold mt-4 ">ALTS</h2> : null}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 place-content-center text-center ">
          {allTeams
            ?.find((e) => e.contactPerson === auth?.user?.email)
            ?.players.map((player) =>
              player.alts?.map((alt, altIndex) => (
                <PlayerInfo
                  key={altIndex}
                  player={{
                    characterName: alt.altCharacterName,
                    realmName: alt.altRealmName,
                    altOf: player.characterName,
                  }}
                />
              )),
            )}
        </div>
        <Link href={`/signup/editTeam/${teamSlug}`}>
          <Button
            onClick={() => {
              setLoading(true)
            }}
            className="mt-4 mb-4"
          >
            Legg til eller fjern spillere
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ExistingTeam
