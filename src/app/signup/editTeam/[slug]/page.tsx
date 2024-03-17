'use client'

import { AltPlayer, MythicPlusTeam, Player, getAllTeams } from '@/app/api/getAllTeams'
import { signOut, useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Select from 'react-select'
import { colourStyles } from '../../utils/styles'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/loading'
import { PlayerInfoImage } from '../../components/PlayerInfoImage'
import Loading from '../../components/Loading'
import { useRouter } from 'next/navigation'
import { wowRealmsMapped } from '../../utils/wowRealms'
import { CrownIcon, LogOut } from 'lucide-react'
import Link from 'next/link'

function EditTeam() {
  const { data, status } = useSession()

  const router = useRouter()

  const [players, setPlayers] = useState<{ characterName: string; realmName: string; alts?: AltPlayer[] }[]>([
    { characterName: '', realmName: '', alts: [] },
  ])

  const [hasEditedPlayers, setHasEditedPlayers] = useState(false)
  const [allTeams, setAllTeams] = useState<MythicPlusTeam[] | null>(null)
  const hasTeam = allTeams?.find((e) => e.contactPerson === data?.user?.email)
  const teamSlug = useMemo(
    () => allTeams?.find((e) => e.contactPerson === data?.user?.email)?.teamSlug,
    [allTeams, data?.user?.email],
  )
  const [errorUpdatingTeam, setErrorUpdatingTeam] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.prefetch('/signup/signin')
      router.push('/signup/signin')
    }
  }, [router, status, teamSlug])

  useEffect(() => {
    if (allTeams?.find((e) => e.contactPerson === data?.user?.email)) {
      router.push(`/signup/editTeam/${teamSlug}`)
    }

    if (allTeams && !allTeams.find((e) => e.contactPerson === data?.user?.email)) {
      router.push(`/signup`)
    }
  }, [allTeams, data?.user?.email, router, teamSlug])

  useEffect(() => {
    async function fetchAllTeams() {
      const data = await getAllTeams()
      setAllTeams(data)
    }
    fetchAllTeams()
  }, [])

  useEffect(() => {
    if (
      allTeams?.find((e) => e.contactPerson === data?.user?.email)?.teamName &&
      allTeams?.find((e) => e.contactPerson === data?.user?.email)?.players
    ) {
      allTeams
        ?.find((e) => e.contactPerson === data?.user?.email)
        ?.players.map((player, index) => {
          setPlayers((prevPlayers) => [
            ...prevPlayers,
            { characterName: player.characterName, realmName: player.realmName, alts: player.alts },
          ])

          //remove the first empty player
          if (index === 0) {
            setPlayers((prevPlayers) => prevPlayers.filter((_, i) => i !== 0))
          }
        })
    }
  }, [allTeams, data?.user?.email])

  const [playerErrors, setPlayerErrors] = useState<boolean[]>([])

  const [missingPlayersError, setMissingPlayersError] = useState(false)

  const [loadingCreateTeam, setLoadingCreateTeam] = useState(false)

  const updateMythicPlusTeam = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault()

      setLoadingCreateTeam(true)

      try {
        const mutations = [
          {
            createOrReplace: {
              _type: 'MythicPlusTeam',
              _id: allTeams?.find((e) => e.contactPerson === data?.user?.email)?._id,
              _key: allTeams?.find((e) => e.contactPerson === data?.user?.email)?._key,
              teamName: allTeams?.find((e) => e.contactPerson === data?.user?.email)?.teamName,
              contactPerson: allTeams?.find((e) => e.contactPerson === data?.user?.email)?.contactPerson,
              teamSlug: allTeams?.find((e) => e.contactPerson === data?.user?.email)?.teamSlug,
              teamImage: {
                ...allTeams?.find((e) => e.contactPerson === data?.user?.email)?.teamImage,
              },
              players: players.map((player) => ({
                _type: 'Player',
                _key: uuidv4(),
                characterName: player.characterName,
                realmName: player.realmName,
                alts: player.alts?.map((alt) => ({
                  _key: uuidv4(),
                  altCharacterName: alt.altCharacterName,
                  altRealmName: alt.altRealmName,
                })),
              })),
            },
          },
        ]

        // Send the mutation to create the draft document
        const response = await fetch(`https://mythic-trials-sanity-api.vercel.app/postToSanity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'https://trials.nl-wow.no', // Include the correct origin header
          },
          body: JSON.stringify({ mutations }),
        })

        if (response.ok) {
          const data = await response.json()

          if (data) {
            setLoadingCreateTeam(false)
            router.prefetch(`/signup/teamCreated/${teamSlug}`)
            router.push(`/signup/teamCreated/${teamSlug}?updated=true`)
          }

          // Handle success
        } else {
          // Handle error response
          console.error('Failed to create Mythic Plus team:', response.statusText)
          setLoadingCreateTeam(false)
        }
      } catch (error) {
        console.error('Failed to create Mythic Plus team:', error)
        setLoadingCreateTeam(false)
        setErrorUpdatingTeam(true)

        // Handle error
      }
    },
    [allTeams, data?.user?.email, players, router, teamSlug],
  )

  const handlePlayerChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target

    setPlayers((prevPlayers) => prevPlayers.map((player, i) => (i === index ? { ...player, [name]: value } : player)))

    setHasEditedPlayers(true)
  }
  const handleAddPlayer = () => {
    setPlayers([...players, { characterName: '', realmName: '' }])
  }

  const handleAddAltPlayer = (index: number) => {
    setHasEditedPlayers(true)
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, i) =>
        i === index
          ? {
              ...player,
              alts: [...(player.alts || []), { altCharacterName: '', altRealmName: '' }],
            }
          : player,
      ),
    )
  }

  // Function to remove an alt player for a specific main player
  const handleRemoveAltPlayer = (mainPlayerIndex: number, altIndex: number) => {
    setHasEditedPlayers(true)
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, i) =>
        i === mainPlayerIndex
          ? {
              ...player,
              alts: player.alts ? player.alts.filter((_, idx) => idx !== altIndex) : [], // Remove the alt player at the specified index
            }
          : player,
      ),
    )
  }

  const handleAltPlayerChange = (
    mainPlayerIndex: number,
    altIndex: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setPlayers((prevPlayers) =>
      prevPlayers.map((player, i) =>
        i === mainPlayerIndex
          ? {
              ...player,
              alts: player.alts?.map((alt, altIdx) =>
                altIdx === altIndex
                  ? {
                      ...alt,
                      [name]: value,
                    }
                  : alt,
              ),
            }
          : player,
      ),
    )

    setHasEditedPlayers(true)
  }

  const handleRemovePlayer = (index: number) => {
    setPlayers((prevPlayers) => prevPlayers.filter((_, i) => i !== index))
    setHasEditedPlayers(true)
  }
  if (loadingCreateTeam) return <Loading creatingTeam={true} />

  if (status === 'loading' || status === 'unauthenticated') return <Loading />
  if (errorUpdatingTeam) {
    return (
      <div className="w-full h-svh items-center flex justify-center font-bold text-2xl text-center flex-col gap-10">
        <div>Kunne ikke oppdatere lag. Vennligst prøv igjen. Hvis problemet vedvarer, kontakt en admin.</div>
        <button onClick={() => setErrorUpdatingTeam(false)} className="bg-white text-black rounded-full p-2 min-w-44">
          Prøv igjen
        </button>
      </div>
    )
  }

  return (
    hasTeam && (
      <>
        <div className="flex justify-end p-2">
          <button className="text-white mr-2" onClick={() => signOut()}>
            Logg ut
          </button>
          <LogOut />
        </div>

        <div className="flex justify-center flex-col items-center  text-white py-8">
          <h1 className="text-4xl font-bold mb-10">Oppdater ditt lag</h1>

          <form className="flex flex-col w-full p-4 lg:w-2/4   rounded-lg " onSubmit={updateMythicPlusTeam}>
            <label htmlFor="contactPerson" className="mb-2 text-lg font-bold">
              Kontakt person
            </label>
            <input
              className="rounded-lg p-2 mb-4 w-full lg:w-1/2 bg-gray-800 text-white"
              name="contactPerson"
              type="email"
              value={data?.user?.email ?? ''}
              readOnly
            />
            <label htmlFor="teamName" className="mb-2">
              <span className="font-bold text-lg">Lagnavn: </span>
            </label>
            <input
              id="teamName"
              name="teamName"
              type="text"
              placeholder="Lagnavn"
              className="rounded-lg p-2 mb-4 w-full lg:w-1/2 bg-gray-800 text-white"
              readOnly
              disabled
              value={allTeams?.find((e) => e.contactPerson === data?.user?.email)?.teamName ?? ''}
            />
            <div className="mb-8 -mt-2">
              Ønsker du å endre navn på laget ditt i etterkant må du kontakte en{' '}
              <Link href="/contact" target="_blank">
                <span className="text-[#FDB202] underline">admin.</span>
              </Link>
            </div>
            <label className="mb-4 mt-10 font-bold text-2xl">Spillerene på laget</label>
            <div className="flex flex-col">
              {players.map((player, index) => (
                <div key={index} className="mb-4 bg-[#000F1A] p-8 ">
                  {index === 0 ? (
                    <span className="font-bold ">
                      Lagets kaptein <CrownIcon className="inline" fill="#FDB202" color="#FDB202" height={20} />
                    </span>
                  ) : (
                    <span className="font-bold ">Spiller {index + 1}:</span>
                  )}
                  <div className="mb-2" />
                  <div className="flex">
                    <input
                      type="text"
                      value={player.characterName?.trim()}
                      onChange={(e) => handlePlayerChange(index, e)}
                      name={'characterName'} // Set a unique name for character names
                      placeholder="Karakter navn"
                      className=" rounded-l-lg  p-2 mb-2 w-full bg-gray-800 text-white"
                    />
                    {player.characterName &&
                    player.realmName &&
                    wowRealmsMapped.find((e) => e.name === player.realmName)?.name ? (
                      <PlayerInfoImage player={player as Player} />
                    ) : null}
                  </div>

                  <Select
                    styles={colourStyles}
                    options={wowRealmsMapped}
                    value={wowRealmsMapped.find((e) => e.name === player.realmName)}
                    isClearable
                    isSearchable
                    name="realmName"
                    placeholder="Velg realm"
                    onChange={(e: any) => {
                      const event = {
                        target: {
                          value: e?.name,
                          name: 'realmName',
                        },
                      }

                      setPlayerErrors((prevErrors) => prevErrors.map((error, i) => (i === index ? false : error)))
                      handlePlayerChange(index, event as React.ChangeEvent<HTMLInputElement>)
                    }}
                  />
                  {player.alts && player.alts.length > 0 ? (
                    <div className="mt-4"> Alts av {player.characterName} </div>
                  ) : null}
                  {player.alts?.map((alt, altIndex) => (
                    <div key={altIndex} className="mb-4">
                      <div className="flex">
                        <input
                          type="text"
                          value={alt?.altCharacterName?.trim()}
                          onChange={(e) => handleAltPlayerChange(index, altIndex, e)}
                          name={'altCharacterName'} // Set a unique name for character names
                          placeholder="Karakter navn"
                          className=" rounded-l-lg  p-2 mb-2 w-full bg-gray-800 text-white"
                        />
                        {alt.altCharacterName &&
                        alt.altRealmName &&
                        wowRealmsMapped.find((e) => e.name === alt.altRealmName)?.name ? (
                          <PlayerInfoImage
                            player={{ characterName: alt.altCharacterName, realmName: alt.altRealmName } as Player}
                          />
                        ) : null}
                      </div>

                      <Select
                        styles={colourStyles}
                        options={wowRealmsMapped}
                        value={wowRealmsMapped.find((e) => e.name === alt.altRealmName)}
                        isClearable
                        isSearchable
                        name="altRealmName"
                        placeholder="Velg realm"
                        onChange={(e: any) => {
                          const event = {
                            target: {
                              value: e?.name,
                              name: 'altRealmName',
                            },
                          }

                          setPlayerErrors((prevErrors) => prevErrors.map((error, i) => (i === index ? false : error)))
                          handleAltPlayerChange(index, altIndex, event as React.ChangeEvent<HTMLInputElement>)
                        }}
                      />
                      <Button
                        className="bg-red-500 mt-2 text-white rounded-full"
                        type="button"
                        onClick={() => handleRemoveAltPlayer(index, altIndex)}
                      >
                        Fjern alt {altIndex + 1}
                      </Button>
                    </div>
                  ))}

                  {playerErrors[index] && (
                    <p className="text-red-500 mb-2">Fyll inn både karakternavn og realm for spiller {index + 1}.</p>
                  )}
                  <div className="flex">
                    <Button
                      className=" w-2/3   rounded-full border-none lg:w-44 md:w-44 mr-2 mt-2 inline-block text-xs px-2 py-2 leading-none border   bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-32 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white"
                      type="button"
                      onClick={() => handleAddAltPlayer(index)} // Call handleAddAltPlayer function with the index of the main player
                    >
                      Legg til alt av {player.characterName}
                    </Button>

                    {index === 0 ? null : (
                      <Button
                        className="w-1/3 lg:w-44 md:w-44 bg-red-500 mt-2 text-white  rounded-full"
                        type="button"
                        onClick={() => handleRemovePlayer(index)}
                        aria-label={`Remove player ${index + 1}`}
                      >
                        Fjern {player.characterName ?? index + 1}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {players && players.length >= 7 ? (
              <p className="text-white mb-4">Du har nådd maks antall spillere (7)</p>
            ) : (
              <Button
                className=" mb-4 max-w-52 inline-block text-xs px-2 py-2 leading-none border border-none rounded-xl  bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-32 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white"
                type="button"
                onClick={handleAddPlayer}
              >
                Legg til ny spiller
              </Button>
            )}
            {missingPlayersError && <p className="text-red-500 mb-4">Legg til minst 5 spillere.</p>}
            {players && players.length ? players.length : 0} av maks 7 spillere lagt til.
            {hasEditedPlayers ? (
              <Button
                disabled={
                  players?.some((e) => e.characterName?.length === 0 || e.realmName?.length === 0) ||
                  loadingCreateTeam ||
                  (players && players.length <= 4)
                }
                className=" mt-10 min-h-10 px-4 py-3.5 rounded-xl   bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-36 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white transition translate duration-500 hover:scale-105"
                type="submit"
              >
                {players?.some((e) => e.characterName?.length === 0 || e.realmName?.length === 0) ||
                playerErrors.some((e) => e === true) ||
                (players && players.length <= 4)
                  ? 'Mangler info for å oppdatere lag'
                  : loadingCreateTeam
                    ? 'Oppdaterer lag'
                    : 'Oppdater lag'}
                {loadingCreateTeam ? <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" /> : null}
              </Button>
            ) : (
              <p>Du må gjøre noen endringer før du kan oppdatere.</p>
            )}
          </form>
        </div>
      </>
    )
  )
}

export default EditTeam
