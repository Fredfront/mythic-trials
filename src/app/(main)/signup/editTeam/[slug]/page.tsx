'use client'

import { AltPlayer, MythicPlusTeam, Player, getAllTeams } from '@/app/api/getAllTeams'
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
import { CrownIcon, PlusCircle, Trash2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useGetUserData } from '@/app/auth/useGetUserData'

function EditTeam() {
  const { user, loading } = useGetUserData()
  const router = useRouter()

  const [players, setPlayers] = useState<
    { characterName: string; realmName: string; discordName: string; alts?: AltPlayer[]; twitchChannel?: string }[]
  >([{ characterName: '', realmName: '', discordName: '', alts: [] }])

  const [hasEditedPlayers, setHasEditedPlayers] = useState(false)
  const [allTeams, setAllTeams] = useState<MythicPlusTeam[] | null>(null)
  const hasTeam = allTeams?.find((e) => e.contactPerson === user?.data.user?.email)
  const teamSlug = useMemo(
    () => allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?.teamSlug,
    [allTeams, user?.data.user?.email],
  )
  const [errorUpdatingTeam, setErrorUpdatingTeam] = useState(false)
  const [playerErrors, setPlayerErrors] = useState<boolean[]>([])
  const [missingPlayersError, setMissingPlayersError] = useState(false)
  const [loadingCreateTeam, setLoadingCreateTeam] = useState(false)

  useEffect(() => {
    if (!loading && user?.data.user?.email === undefined) {
      router.prefetch('/signup/signin')
      router.push('/signup/signin')
    }
  }, [loading, router, teamSlug, user?.data.user?.email])

  useEffect(() => {
    if (loading) return
    if (!loading && allTeams?.find((e) => e.contactPerson === user?.data.user?.email)) {
      router.push(`/signup/editTeam/${teamSlug}`)
    }

    if (!loading && allTeams && !allTeams.find((e) => e.contactPerson === user?.data.user?.email)) {
      router.push(`/signup`)
    }
  }, [allTeams, user?.data.user?.email, router, teamSlug, loading])

  useEffect(() => {
    async function fetchAllTeams() {
      const data = await getAllTeams()
      setAllTeams(data)
    }
    fetchAllTeams()
  }, [])

  useEffect(() => {
    if (
      allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?.teamName &&
      allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?.players
    ) {
      allTeams
        ?.find((e) => e.contactPerson === user?.data.user?.email)
        ?.players.map((player, index) => {
          setPlayers((prevPlayers) => [
            ...prevPlayers,
            {
              characterName: player.characterName,
              realmName: player.realmName,
              discordName: player.discordName,
              twitchChannel: player.twitchChannel,
              alts: player.alts,
            },
          ])

          //remove the first empty player
          if (index === 0) {
            setPlayers((prevPlayers) => prevPlayers.filter((_, i) => i !== 0))
          }
        })
    }
  }, [allTeams, user?.data.user?.email])

  const updateMythicPlusTeam = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault()
      setLoadingCreateTeam(true)

      try {
        const mutations = [
          {
            createOrReplace: {
              _type: 'MythicPlusTeam',
              _id: allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?._id,
              _key: allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?._key,
              teamName: allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?.teamName,
              contactPerson: allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?.contactPerson,
              teamSlug: allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?.teamSlug,
              teamImage: {
                ...allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?.teamImage,
              },
              players: players.map((player) => ({
                _type: 'Player',
                _key: uuidv4(),
                characterName: player.characterName,
                realmName: player.realmName,
                discordName: player.discordName,
                twitchChannel: player.twitchChannel,
                alts: player.alts?.map((alt) => ({
                  _key: uuidv4(),
                  altCharacterName: alt.altCharacterName,
                  altRealmName: alt.altRealmName,
                })),
              })),
            },
          },
        ]

        const response = await fetch(`https://mythic-trials-sanity-api.vercel.app/postToSanity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'https://trials.nl-wow.no',
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
        } else {
          console.error('Failed to create Mythic Plus team:', response.statusText)
          setLoadingCreateTeam(false)
        }
      } catch (error) {
        console.error('Failed to create Mythic Plus team:', error)
        setLoadingCreateTeam(false)
        setErrorUpdatingTeam(true)
      }
    },
    [allTeams, user?.data.user?.email, players, router, teamSlug],
  )

  const handlePlayerChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setPlayers((prevPlayers) => prevPlayers.map((player, i) => (i === index ? { ...player, [name]: value } : player)))
    setHasEditedPlayers(true)
  }

  const handleAddPlayer = () => {
    setPlayers([...players, { characterName: '', discordName: '', realmName: '' }])
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

  const handleRemoveAltPlayer = (mainPlayerIndex: number, altIndex: number) => {
    setHasEditedPlayers(true)
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, i) =>
        i === mainPlayerIndex
          ? {
              ...player,
              alts: player.alts ? player.alts.filter((_, idx) => idx !== altIndex) : [],
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

  if (loadingCreateTeam) return <Loading updatingTeam={true} />

  if (errorUpdatingTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#011624] text-white">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Kunne ikke oppdatere lag</h2>
        <p className="text-center mb-8">Vennligst prøv igjen. Hvis problemet vedvarer, kontakt en admin.</p>
        <button
          onClick={() => setErrorUpdatingTeam(false)}
          className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-full hover:bg-yellow-600 transition duration-300"
        >
          Prøv igjen
        </button>
      </div>
    )
  }

  return (
    hasTeam && (
      <div className="min-h-screen bg-[#011624] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Oppdater ditt lag</h1>

          <form className="space-y-8" onSubmit={updateMythicPlusTeam}>
            <div className="space-y-4">
              <label htmlFor="contactPerson" className="block text-sm font-medium">
                Kontakt person
              </label>
              <input
                className="w-full px-3 py-2 bg-gray-800 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                name="contactPerson"
                type="email"
                value={user?.data.user?.email ?? ''}
                readOnly
              />
            </div>

            <div className="space-y-4">
              <label htmlFor="teamName" className="block text-sm font-medium">
                Lagnavn
              </label>
              <input
                id="teamName"
                name="teamName"
                type="text"
                placeholder="Lagnavn"
                className="w-full px-3 py-2 bg-gray-800 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                readOnly
                disabled
                value={allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?.teamName ?? ''}
              />
            </div>

            <div className="text-sm">
              Ønsker du å endre navn på laget ditt i etterkant må du kontakte en{' '}
              <Link href="/contact" target="_blank" className="text-yellow-400 underline">
                admin.
              </Link>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Spillerne på laget</h2>
              {players.map((player, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-lg space-y-4">
                  <div className="flex items-center space-x-2">
                    {index === 0 ? (
                      <>
                        <span className="font-bold">Lagets kaptein</span>
                        <CrownIcon className="text-yellow-400" size={20} />
                      </>
                    ) : (
                      <span className="font-bold">Spiller {index + 1}</span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <input
                        required
                        type="text"
                        value={player.characterName?.trim()}
                        onChange={(e) => handlePlayerChange(index, e)}
                        name="characterName"
                        placeholder="Karakter navn"
                        className="flex-grow px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      />
                      {player.characterName &&
                        player.realmName &&
                        wowRealmsMapped.find((e) => e.name === player.realmName)?.name && (
                          <PlayerInfoImage player={player as Player} />
                        )}
                    </div>
                    <input
                      required
                      type="text"
                      value={player.discordName}
                      onChange={(e) => handlePlayerChange(index, e)}
                      name="discordName"
                      placeholder="Discord brukernavn"
                      className="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={player.twitchChannel}
                      onChange={(e) => handlePlayerChange(index, e)}
                      name="twitchChannel"
                      placeholder="Twitch kanal (valgfritt)"
                      className="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                    <Select
                      required
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
                  </div>

                  {player.alts && player.alts.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <h3 className="font-bold">Alts av {player.characterName}</h3>
                      {player.alts.map((alt, altIndex) => (
                        <div key={altIndex} className="space-y-4">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={alt?.altCharacterName?.trim()}
                              onChange={(e) => handleAltPlayerChange(index, altIndex, e)}
                              name="altCharacterName"
                              placeholder="Karakter navn"
                              className="flex-grow px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                            />
                            {alt.altCharacterName &&
                              alt.altRealmName &&
                              wowRealmsMapped.find((e) => e.name === alt.altRealmName)?.name && (
                                <PlayerInfoImage
                                  player={
                                    { characterName: alt.altCharacterName, realmName: alt.altRealmName } as Player
                                  }
                                />
                              )}
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
                              setPlayerErrors((prevErrors) =>
                                prevErrors.map((error, i) => (i === index ? false : error)),
                              )
                              handleAltPlayerChange(index, altIndex, event as React.ChangeEvent<HTMLInputElement>)
                            }}
                          />
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white transition duration-300"
                            type="button"
                            onClick={() => handleRemoveAltPlayer(index, altIndex)}
                          >
                            <Trash2 className="mr-2" size={16} />
                            Fjern alt {altIndex + 1}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {playerErrors[index] && (
                    <p className="text-red-500 text-sm">Fyll inn både karakternavn og realm for spiller {index + 1}.</p>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      className="flex-grow bg-yellow-500 text-black hover:bg-yellow-600 transition duration-300"
                      type="button"
                      onClick={() => handleAddAltPlayer(index)}
                    >
                      <PlusCircle className="mr-2" size={16} />
                      Legg til alt av {player.characterName || `spiller ${index + 1}`}
                    </Button>
                    {index !== 0 && (
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white transition duration-300"
                        type="button"
                        onClick={() => handleRemovePlayer(index)}
                        aria-label={`Remove player ${index + 1}`}
                      >
                        <Trash2 className="mr-2" size={16} />
                        Fjern {player.characterName || `spiller ${index + 1}`}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {players && players.length >= 7 ? (
              <p className="text-yellow-400">Du har nådd maks antall spillere (7)</p>
            ) : (
              <Button
                className="w-full bg-yellow-500 text-black hover:bg-yellow-600 transition duration-300"
                type="button"
                onClick={handleAddPlayer}
              >
                <PlusCircle className="mr-2" size={16} />
                Legg til ny spiller
              </Button>
            )}

            {missingPlayersError && <p className="text-red-500 text-sm">Legg til minst 5 spillere.</p>}

            <p className="text-sm text-gray-400">
              {players && players.length ? players.length : 0} av maks 7 spillere lagt til.
            </p>

            {hasEditedPlayers ? (
              <Button
                disabled={
                  players?.some((e) => e.characterName?.length === 0 || e.realmName?.length === 0) ||
                  loadingCreateTeam ||
                  (players && players.length <= 4)
                }
                className="w-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 transition duration-300"
                type="submit"
              >
                {players?.some((e) => e.characterName?.length === 0 || e.realmName?.length === 0) ||
                playerErrors.some((e) => e === true) ||
                (players && players.length <= 4)
                  ? 'Mangler info for å oppdatere lag'
                  : loadingCreateTeam
                    ? 'Oppdaterer lag'
                    : 'Oppdater lag'}
                {loadingCreateTeam && <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            ) : (
              <p className="text-center text-gray-400">Du må gjøre noen endringer før du kan oppdatere.</p>
            )}
          </form>
        </div>
      </div>
    )
  )
}

export default EditTeam
