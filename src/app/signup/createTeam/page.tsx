'use client'
import { AltPlayer, MythicPlusTeam, getAllTeams, Player } from '@/app/api/getAllTeams'
import { Icons } from '@/components/loading'
import { Button } from '@/components/ui/button'
import { signOut, useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { colourStyles } from '../utils/styles'
import { v4 as uuidv4 } from 'uuid'
import Select from 'react-select'
import Image from 'next/image'
import { PlayerInfoImage } from '../components/PlayerInfoImage'
import { useRouter } from 'next/navigation'
import Loading from '../components/Loading'
import { wowRealmsMapped } from '../utils/wowRealms'
import { CrownIcon, LogOut } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Link from 'next/link'

function CreateTeam() {
  const { data, status } = useSession()
  const [teamName, setTeamName] = useState('')
  const [teamImage, setTeamImage] = useState<any>(null)
  const [players, setPlayers] = useState<{ characterName: string; realmName: string; alts?: AltPlayer[] }[]>([
    { characterName: '', realmName: '', alts: [] },
  ])
  const router = useRouter()

  const [allTeams, setAllTeams] = useState<MythicPlusTeam[] | null>(null)
  const [previewImage, setPreviewImage] = useState<any>(null)

  const teamSlug = teamName?.toLowerCase().replace(/\s+/g, '-').slice(0, 200)

  const userEmail = useMemo(() => data?.user?.email, [data?.user?.email])

  // State for input field errors
  const [teamNameError, setTeamNameError] = useState(false)
  const [playerErrors, setPlayerErrors] = useState<boolean[]>([])
  const [uploadedImage, setUploadedImage] = useState<any>(null)
  const [imageUploaded, setImageUploaded] = useState(false)
  const [missingImageError, setMissingImageError] = useState(false)
  const [missingPlayersError, setMissingPlayersError] = useState(false)
  const [loadingCreateTeam, setLoadingCreateTeam] = useState(false)
  const [teamNameAlreadyExists, setTeamNameAlreadyExists] = useState(false)
  const [createTeamError, setCreateTeamError] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signup/signin')
    }
  }, [router, status])

  useEffect(() => {
    async function fetchAllTeams() {
      const data = await getAllTeams()
      setAllTeams(data)
    }
    fetchAllTeams()
  }, [])

  useEffect(() => {
    if (allTeams?.find((e) => e.contactPerson === data?.user?.email)) {
      router.push('/signup/existingTeam')
    }
  }, [allTeams, data?.user?.email, router])
  // State for image preview

  const handlePlayerChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target

    setPlayers((prevPlayers) => prevPlayers.map((player, i) => (i === index ? { ...player, [name]: value } : player)))
  }
  const handleAddPlayer = () => {
    setPlayers([...players, { characterName: '', realmName: '' }])
  }

  const handleAddAltPlayer = (index: number) => {
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
  }

  const handleRemovePlayer = (index: number) => {
    setPlayers((prevPlayers) => prevPlayers.filter((_, i) => i !== index))
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0]
    if (file && file.type.startsWith('image')) {
      setTeamImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result === null) return
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function addImage() {
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

  useEffect(() => {
    if (allTeams?.find((e) => e.teamName === teamName)) {
      setTeamNameAlreadyExists(true)
    }
  }, [allTeams, teamName])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (allTeams?.find((e) => e.teamName === teamName)) {
      setTeamNameAlreadyExists(true)
      return
    }

    if (players && players.length < 5) {
      setMissingPlayersError(true)
    }
    if (!teamImage) {
      setMissingImageError(true)
    }
    if (!teamName.trim()) {
      setTeamNameError(true)
    } else {
      setTeamNameError(false)
    }
    // Validate players
    const playerValidation = players.map((player) => !player.characterName.trim() || !player.realmName.trim())
    if (playerValidation.some((error) => error)) {
      setPlayerErrors(playerValidation)
    } else {
      setPlayerErrors([])
    }

    try {
      await addImage()
    } catch (error) {
      setLoadingCreateTeam(false)
    }
  }

  const createMythicPlusTeam = useCallback(async () => {
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
              alts: player.alts,
            })),
          },
        },
      ]

      // Send the mutation to create the draft document
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

      // Handle error
    }
  }, [players, router, teamName, teamSlug, uploadedImage?.data?.document?._id, userEmail])

  useEffect(() => {
    if (imageUploaded) {
      createMythicPlusTeam()
      setImageUploaded(false)
    }
  }, [createMythicPlusTeam, imageUploaded])

  useEffect(() => {
    if (allTeams?.find((e) => e.contactPerson === data?.user?.email)?.teamName) {
      setTeamName(allTeams?.find((e) => e.contactPerson === data?.user?.email)?.teamName as string)
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

  const hideCreateTeamButton =
    players?.some((e) => e.characterName?.length === 0 || e.realmName?.length === 0) ||
    teamNameAlreadyExists ||
    teamNameError ||
    (players && players.length <= 4) ||
    teamName === '' ||
    teamImage === null

  if (loadingCreateTeam) return <Loading creatingTeam={true} />
  if (status === 'loading' || status === 'unauthenticated') return <Loading />
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
    status === 'authenticated' && (
      <>
        <div className="flex justify-end p-2">
          <button className="text-white mr-2" onClick={() => signOut()}>
            Logg ut
          </button>
          <LogOut />
        </div>
        <div className="flex flex-col max-w-7xl justify-start items-center  text-white py-8">
          <h1 className="lg:w-2/4 text-5xl font-bold mb-10">Påmelding</h1>
          <p className="mb-10 lg:w-2/4 ">Her kan du melde på laget ditt. Frist 25. mars.</p>
          <form className="flex flex-col w-full p-4 md:p-0 md:w-2/4" onSubmit={handleSubmit}>
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
            <label htmlFor="teamName" className="mb-2 text-lg font-bold">
              Lagnavn
            </label>
            <input
              id="teamName"
              name="teamName"
              type="text"
              placeholder="Lagnavn"
              className="rounded-lg p-2 mb-4 w-full lg:w-1/2 bg-gray-800 text-white"
              value={teamName}
              onChange={(e) => {
                setTeamNameError(false)
                setTeamName(e.target.value)
              }}
            />
            <div className="mb-8 -mt-2">
              Ønsker du å endre navn på laget ditt i etterkant må du kontakte en{' '}
              <Link href="/contact" target="_blank">
                <span className="text-[#FDB202] underline">admin.</span>
              </Link>
            </div>

            {teamNameAlreadyExists && (
              <p className="text-red-500 mb-4 mt-4">Lagnavnet eksisterer allerede. Vennligst velg et annet navn.</p>
            )}
            {teamNameError && <p className="text-red-500 mb-4">Fyll inn et lagnavn.</p>}

            <label htmlFor="teamImage" className="mb-2 font-bold text-lg">
              Lagbilde <br /> <span className=" text-xs">Maks 2MB (png, jpg, jpeg, webp, svg)</span> <br />{' '}
            </label>
            <input
              type="file"
              id="teamImage"
              onChange={(e) => {
                if (e.target.files?.[0]?.type?.includes('image') === false) {
                  alert('Du kan kun laste opp bilder. Prøv igjen.')
                  return
                }
                if (e.target.files && e.target.files?.[0]?.size > 2000000) {
                  alert('Bildet er for stort. Maks 2MB')
                  return
                }

                handleFileUpload(e)
              }}
              accept="image/*"
              className="mb-4"
            />
            {missingImageError && teamImage === null && (
              <p className="text-red-500 mb-4">Last opp et bilde for laget.</p>
            )}

            {/* Display the image preview if available */}
            {previewImage && (
              <div className="mb-4">
                <label>Image Preview:</label>
                <Image width={250} height={250} src={previewImage} alt="Team" className="max-w-full h-auto" />
              </div>
            )}

            <label className="mb-4 mt-10 font-bold text-2xl">Spillerene på laget</label>
            <div className="flex flex-col">
              {players.map((player, index) => (
                <div key={index} className="mb-4 bg-[#000F1A] p-8 ">
                  {index === 0 ? (
                    <span>
                      <span className="font-bold">Lagets kaptein </span>{' '}
                      <CrownIcon className="inline" fill="#FDB202" color="#FDB202" height={20} />
                      <div className="w-full">
                        <Dialog>
                          <DialogTrigger>
                            <p className="text-xs mt-1 mb-1 cursor-pointer">Hva er rollen til lagets kaptein?</p>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Lagets kaptein sin rolle</DialogTitle>
                              <DialogDescription>
                                Lagets kaptein har ansvaret for å holde seg oppdatert på informasjon admins gir og
                                videreformidle informasjon til resten av laget.{' '}
                              </DialogDescription>
                              <DialogDescription>
                                Kapteinen vil være administratorers direkte kontaktpunkt inn mot laget, og laget står
                                selv ansvarlig for at all informasjon kommunisert gjennom kapteinen blir sendt videre
                                til sine lagspillere.
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </div>
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
                      className="rounded-l-lg p-2 mb-2 w-full bg-gray-800 "
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
                    className="mb-2"
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
                    <div className="mt-4 mb-2 font-bold"> Alts av {player.characterName} </div>
                  ) : null}
                  {player.alts?.map((alt, altIndex) => (
                    <div key={altIndex} className="mb-4">
                      <span className="font-bold mt-4">Alt {altIndex + 1}:</span>
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
                        className="bg-red-500 mt-2 hover:bg-red-500 hover:scale-105 text-white"
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
                      className=" rounded-full w-2/3 lg:w-44 md:w-44 mr-2 mt-2 px-2 py-2 bg-white text-black border-2 border-[#FDB202]   transition translate duration-500 hover:scale-105 min-w-44 md:min-w-52 min-h-10 "
                      type="button"
                      onClick={() => handleAddAltPlayer(index)} // Call handleAddAltPlayer function with the index of the main player
                    >
                      Legg til alt av{' '}
                      {player.characterName && player.characterName.length > 0
                        ? player.characterName
                        : 'spiller ' + (index + 1)}
                    </Button>
                    {index === 0 ? null : (
                      <Button
                        className="w-1/3 lg:w-44 md:w-44 bg-red-500 mt-2 hover:bg-red-500 hover:scale-105  text-white rounded-full"
                        type="button"
                        onClick={() => handleRemovePlayer(index)}
                        aria-label={`Remove player ${index + 1}`}
                      >
                        Fjern spiller {index + 1}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {players && players.length >= 7 ? (
              <p className="text-white mb-4">Du har nådd maks antall spillere (7)</p>
            ) : (
              <button
                className="px-2 py-2 rounded-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 max-w-52 mt-4 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white transition translate duration-500 hover:scale-105"
                type="button"
                onClick={handleAddPlayer}
              >
                Legg til ny spiller
              </button>
            )}
            {teamNameAlreadyExists && (
              <p className="text-red-500 mb-4">Lagnavnet eksisterer allerede. Vennligst velg et annet navn.</p>
            )}
            {missingPlayersError && <p className="text-red-500 mb-4">Legg til minst 5 spillere.</p>}
            {teamName === '' && players && players.length > 4 && (
              <p className="text-red-500 mb-4">* Fyll inn et lagnavn.</p>
            )}

            {players && players.length > 4 && teamImage === null ? (
              <p className="text-red-500 mb-4">* Last opp et bilde for laget.</p>
            ) : null}
            {hideCreateTeamButton ? null : (
              <button
                className="mt-10   min-h-10 px-4 py-3.5 rounded-xl   bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-36 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white transition translate duration-500 hover:scale-105 "
                type="submit"
              >
                {loadingCreateTeam ? 'Oppretter lag...' : 'Opprett lag'}
                {loadingCreateTeam ? <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" /> : null}
              </button>
            )}
          </form>
        </div>
      </>
    )
  )
}

export default CreateTeam
