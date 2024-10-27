'use client'
import { AltPlayer, MythicPlusTeam, getAllTeams, Player } from '@/app/api/getAllTeams'
import { Icons } from '@/components/loading'
import { Button } from '@/components/ui/button'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { colourStyles } from '../utils/styles'
import { v4 as uuidv4 } from 'uuid'
import Select from 'react-select'
import Image from 'next/image'
import { PlayerInfoImage } from '../components/PlayerInfoImage'
import { useRouter } from 'next/navigation'
import Loading from '../components/Loading'
import { wowRealmsMapped } from '../utils/wowRealms'
import { CrownIcon, PlusCircle, Trash2 } from 'lucide-react'

import Link from 'next/link'
import { useGetUserData } from '../../../auth/useGetUserData'
import supabase from '@/utils/supabase/client'

function CreateTeam({ allTeams }: { allTeams: MythicPlusTeam[] })
{
  const { user, loading } = useGetUserData()
  const discordUsername: string | undefined = user?.data.user?.identities?.find((e) => e.provider === 'discord')?.identity_data?.full_name ?? undefined

  const [ teamName, setTeamName ] = useState('')
  const [ teamImage, setTeamImage ] = useState<any>(null)
  const [ players, setPlayers ] = useState<
    { characterName: string; realmName: string; discordName: string; twitchChannel?: string; alts?: AltPlayer[] }[]
  >([ { characterName: '', realmName: '', discordName: '', alts: [] } ])
  const router = useRouter()

  const [ previewImage, setPreviewImage ] = useState<any>(null)

  const teamSlug = useMemo(() => teamName?.toLowerCase().replace(/\s+/g, '-').slice(0, 200), [ teamName ])
  const userEmail = user?.data.user?.email

  // State for input field errors
  const [ teamNameError, setTeamNameError ] = useState(false)
  const [ playerErrors, setPlayerErrors ] = useState<boolean[]>([])
  const [ uploadedImage, setUploadedImage ] = useState<any>(null)
  const [ imageUploaded, setImageUploaded ] = useState(false)
  const [ missingImageError, setMissingImageError ] = useState(false)
  const [ missingPlayersError, setMissingPlayersError ] = useState(false)
  const [ loadingCreateTeam, setLoadingCreateTeam ] = useState(false)
  const [ teamNameAlreadyExists, setTeamNameAlreadyExists ] = useState(false)
  const [ createTeamError, setCreateTeamError ] = useState(false)

  useEffect(() =>
  {
    if (allTeams?.find((e) => e.contactPerson === user?.data.user?.email)) {
      router.push('/signup/existingTeam')
    }
  }, [ allTeams, router, user?.data.user?.email ])
  // State for image preview

  const handlePlayerChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  {
    const { name, value } = event.target

    setPlayers((prevPlayers) => prevPlayers.map((player, i) => (i === index ? { ...player, [ name ]: value } : player)))
  }
  const handleAddPlayer = () =>
  {
    setPlayers([ ...players, { characterName: '', discordName: '', realmName: '' } ])
  }

  const handleAddAltPlayer = (index: number) =>
  {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, i) =>
        i === index
          ? {
            ...player,
            alts: [ ...(player.alts || []), { altCharacterName: '', altRealmName: '' } ],
          }
          : player,
      ),
    )
  }

  // Function to remove an alt player for a specific main player
  const handleRemoveAltPlayer = (mainPlayerIndex: number, altIndex: number) =>
  {
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
  ) =>
  {
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
                  [ name ]: value,
                }
                : alt,
            ),
          }
          : player,
      ),
    )
  }

  const handleRemovePlayer = (index: number) =>
  {
    setPlayers((prevPlayers) => prevPlayers.filter((_, i) => i !== index))
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>)
  {
    const file = e.target.files && e.target.files[ 0 ]

    if (file && !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.')
      return
    }

    if (file && file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB.')
      return
    }

    if (file && file.type.startsWith('image')) {
      setTeamImage(file)
      const reader = new FileReader()
      reader.onloadend = () =>
      {
        if (reader.result === null) return
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function addImage()
  {
    setLoadingCreateTeam(true)
    try {
      const formData = new FormData()
      formData.append('image', teamImage)

      const response = await fetch('https://mythic-trials-sanity-image-upload-api.vercel.app/uploadImage', {
        method: 'POST',
        body: formData,

        headers: {
          Origin: 'https://trials.nl-wow.no', // Include the correct origin header
        },
      })

      const data = await response.json()
      if (response.ok) {
        // Handle success, you may set state or perform further actions
        setUploadedImage(data)
        setImageUploaded(true)
      } else {
        // Handle error
        console.error('Failed to upload image:', data.error)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setLoadingCreateTeam(false)
      setCreateTeamError(true)
    } finally {
      setLoadingCreateTeam(false)
    }
  }

  useEffect(() =>
  {
    if (allTeams?.find((e) => e.teamName === teamName)) {
      setTeamNameAlreadyExists(true)
    }
  }, [ allTeams, teamName ])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) =>
  {
    event.preventDefault()

    let hasErrors = false

    if (allTeams?.find((e) => e.teamName === teamName)) {
      setTeamNameAlreadyExists(true)
      hasErrors = true
    } else {
      setTeamNameAlreadyExists(false)
    }

    if (players.length < 5) {
      setMissingPlayersError(true)
      hasErrors = true
    } else {
      setMissingPlayersError(false)
    }

    if (!teamImage) {
      setMissingImageError(true)
      hasErrors = true
    } else {
      setMissingImageError(false)
    }

    if (!teamName.trim()) {
      setTeamNameError(true)
      hasErrors = true
    } else {
      setTeamNameError(false)
    }

    const playerValidation = players.map(
      (player) => !player.characterName.trim() || !player.realmName.trim() || !player.discordName.trim(),
    )

    if (playerValidation.some((error) => error)) {
      setPlayerErrors(playerValidation)
      hasErrors = true
    } else {
      setPlayerErrors([])
    }

    if (hasErrors) {
      return // Prevent submission if there are errors
    }

    try {
      await addImage()
    } catch (error) {
      setLoadingCreateTeam(false)
    }
  }

  const createMythicPlusTeam = async () =>
  {
    setLoadingCreateTeam(true)

    try {
      const mutations = [
        {
          createOrReplace: {
            _type: 'MythicPlusTeam',
            _id: `drafts.${uuidv4()}`,
            _key: uuidv4(),
            teamName,
            contactPerson: userEmail,
            teamSlug: teamName.toLowerCase().replace(/\s+/g, '-').slice(0, 200),
            teamImage: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: uploadedImage?.data?.document?._id,
              },
            },
            players: players.map((player) => ({
              _type: 'Player',
              _key: uuidv4(),
              characterName: player.characterName,
              realmName: player.realmName,
              discordName: player.discordName,
              twitchChannel: player.twitchChannel,
              alts: player.alts?.map((alt) =>
              {
                return {
                  _key: uuidv4(),
                  altCharacterName: alt.altCharacterName,
                  altRealmName: alt.altRealmName,
                }
              }),
            })),
          },
        },
      ]

      // Send the mutation to create the draft document
      const response = await fetch(`https://mythic-trials-sanity-api.vercel.app/postToSanity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mutations }),
      })

      if (response.ok) {
        const data = await response.json()

        if (data) {
          setLoadingCreateTeam(false)
          router.prefetch(`/signup/teamCreated/${teamSlug}`)
          router.push(`/signup/teamCreated/${teamSlug}?created=true`)
        }

        // Handle success
      } else {
        // Handle error response
        console.error('Failed to create Mythic Plus team:', response.statusText)
      }
    } catch (error) {
      setLoadingCreateTeam(false)
      setCreateTeamError(true)
    } finally {
      await supabase.from('teams').insert([ { name: teamName, contact_person: userEmail, team_slug: teamSlug, discord_username: discordUsername } ])
    }
  }

  useEffect(() =>
  {
    if (imageUploaded) {
      createMythicPlusTeam()
      setImageUploaded(false)
    }
  }, [ createMythicPlusTeam, imageUploaded ])

  useEffect(() =>
  {
    if (allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?.teamName) {
      setTeamName(allTeams?.find((e) => e.contactPerson === user?.data.user?.email)?.teamName as string)
      allTeams
        ?.find((e) => e.contactPerson === user?.data.user?.email)
        ?.players.map((player, index) =>
        {
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
  }, [ allTeams, user?.data.user?.email ])

  const hideCreateTeamButton =
    players?.some((e) => e.characterName?.length === 0 || e.realmName?.length === 0) ||
    teamNameAlreadyExists ||
    teamNameError ||
    (players && players.length <= 4) ||
    teamName === '' ||
    teamImage === null

  if (loadingCreateTeam) return <Loading creatingTeam={true} />
  if (createTeamError) {
    return (
      <div className="w-full h-svh items-center flex justify-center font-bold text-2xl text-center flex-col gap-10">
        <div>Kunne ikke opprette lag. Vennligst prøv igjen. Hvis problemet vedvarer, kontakt en admin.</div>
        <button onClick={() => setCreateTeamError(false)} className="bg-white text-black rounded-full p-2 min-w-44">
          Prøv igjen
        </button>
      </div>
    )
  }

  return (
    user?.data.user?.email && (
      <div className="min-h-screen bg-[#011624] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Påmelding</h1>
          <p className="mb-12 text-center text-lg">Her kan du melde på laget ditt. Frist 25. mars.</p>

          <form className="space-y-8" onSubmit={handleSubmit}>
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
                required
                id="teamName"
                name="teamName"
                type="text"
                placeholder="Lagnavn"
                className="w-full px-3 py-2 bg-gray-800 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                value={teamName}
                onChange={(e) =>
                {
                  setTeamNameError(false)
                  setTeamName(e.target.value)
                }}
              />
              {teamNameError && <p className="text-red-500 text-sm">Fyll inn et lagnavn.</p>}
              {teamNameAlreadyExists && (
                <p className="text-red-500 text-sm">Lagnavnet eksisterer allerede. Vennligst velg et annet navn.</p>
              )}
            </div>

            <div className="text-sm">
              Ønsker du å endre navn på laget ditt i etterkant må du kontakte en{' '}
              <Link href="/contact" target="_blank" className="text-yellow-400 underline">
                admin.
              </Link>
            </div>

            <div className="space-y-4">
              <label htmlFor="teamImage" className="block text-sm font-medium">
                Lagbilde
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="teamImage"
                  onChange={(e) =>
                  {
                    if (e.target.files?.[ 0 ]?.type?.includes('image') === false) {
                      alert('Du kan kun laste opp bilder. Prøv igjen.')
                      return
                    }
                    if (e.target.files && e.target.files?.[ 0 ]?.size > 2000000) {
                      alert('Bildet er for stort. Maks 2MB')
                      return
                    }
                    handleFileUpload(e)
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="teamImage"
                  className="px-4 py-2 bg-yellow-500 text-black rounded-md cursor-pointer hover:bg-yellow-600 transition duration-300"
                >
                  Velg bilde
                </label>
                <span className="text-sm text-gray-300">Maks 2MB (png, jpg, jpeg, webp, svg)</span>
              </div>
              {missingImageError && teamImage === null && (
                <p className="text-red-500 text-sm">Last opp et bilde for laget.</p>
              )}
              {previewImage && (
                <div className="mt-4">
                  <Image width={250} height={250} src={previewImage} alt="Team" className="rounded-md" />
                </div>
              )}
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
                        type="text"
                        value={player.characterName?.trim()}
                        onChange={(e) => handlePlayerChange(index, e)}
                        name="characterName"
                        placeholder="Karakter navn"
                        className="flex-grow px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                        required
                      />
                      {player.characterName &&
                        player.realmName &&
                        wowRealmsMapped.find((e) => e.name === player.realmName)?.name && (
                          <PlayerInfoImage player={player as Player} />
                        )}
                    </div>
                    <input
                      type="text"
                      value={index === 0 && discordUsername ? discordUsername : player.discordName}
                      onChange={(e) => handlePlayerChange(index, e)}
                      name="discordName"
                      disabled={index === 0 && discordUsername ? true : false}
                      placeholder="Discord brukernavn"
                      className="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none disabled:opacity-50"
                      required
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
                      onChange={(e: any) =>
                      {
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
                            onChange={(e: any) =>
                            {
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

                  {playerErrors[ index ] && (
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
                        Fjern spiller {index + 1}
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

            {!hideCreateTeamButton && (
              <Button
                className="w-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 transition duration-300"
                type="submit"
              >
                {loadingCreateTeam ? (
                  <>
                    Oppretter lag...
                    <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  'Opprett lag'
                )}
              </Button>
            )}
          </form>
        </div>
      </div>
    )
  )
}

export default CreateTeam
