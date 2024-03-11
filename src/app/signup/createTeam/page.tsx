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
import { LogOut, PlusCircle } from 'lucide-react'

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

  const teamSlug = useMemo(
    () => allTeams?.find((e) => e.contactPerson === data?.user?.email)?.teamSlug,
    [allTeams, data?.user?.email],
  )

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
      })

      const data = await response.json()
      console.log(data, '@@@@@@IMAGE@@@@@')
      if (response.ok) {
        // Handle success, you may set state or perform further actions
        setUploadedImage(data)
        setImageUploaded(true)
        console.log('Image uploaded successfully:', data)
      } else {
        // Handle error
        console.error('Failed to upload image:', data.error)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setLoadingCreateTeam(false)
    } finally {
      setLoadingCreateTeam(false)
    }
  }

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
      console.error('Error in form submission:', error)
      setLoadingCreateTeam(false)
    }
  }

  const createMythicPlusTeam = useCallback(async () => {
    setLoadingCreateTeam(true)

    // _id: `drafts.${uuidv4()}`,
    try {
      const mutations = [
        {
          createOrReplace: {
            _type: 'MythicPlusTeam',
            _id: `${uuidv4()}`,
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
      console.error('Failed to create Mythic Plus team:', error)
      setLoadingCreateTeam(false)

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
    loadingCreateTeam ||
    teamNameAlreadyExists ||
    teamNameError ||
    (players && players.length <= 4) ||
    teamName === '' ||
    teamImage === null

  if (status === 'loading' || status === 'unauthenticated') return <Loading />

  return (
    status === 'authenticated' && (
      <>
        <div className="flex justify-end p-2">
          <button className="text-white mr-2" onClick={() => signOut()}>
            Logg ut
          </button>
          <LogOut />
        </div>
        <div className="flex justify-center flex-col items-center  text-white py-8">
          <h1 className="text-4xl font-bold  mb-10">Opprett lag</h1>
          <p className="mb-4 pl-4">
            Fyll ut skjemaet under for å opprette laget ditt. Det må være minimum 5 spillere per lag. NB: Husk også å
            legge til eventuelle alts som skal være med i laget. <br /> Det er mulig å oppdatere mains/alts etter
            opprettelse.
          </p>
          <form className="flex flex-col w-full p-4 lg:w-2/4" onSubmit={handleSubmit}>
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
            {teamNameAlreadyExists && (
              <p className="text-red-500 mb-4">Lagnavnet eksisterer allerede. Vennligst velg et annet navn.</p>
            )}
            {teamNameError && <p className="text-red-500 mb-4">Fyll inn et lagnavn.</p>}

            <label htmlFor="teamImage" className="mb-2 font-bold text-lg">
              Lagbilde (.png eller .jpeg, .webp, .svg) <br /> <span className=" text-xs">Maks 2MB</span>
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

            <label className="mb-4 mt-10 font-bold text-lg">Spillere:</label>
            {players.map((player, index) => (
              <div key={index} className="mb-4">
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
                    className="w-1/3 lg:w-44 md:w-44 bg-red-500 mt-2 hover:bg-red-500 hover:scale-105  text-white"
                    type="button"
                    onClick={() => handleRemovePlayer(index)}
                    aria-label={`Remove player ${index + 1}`}
                  >
                    Fjern spiller {index + 1}
                  </Button>
                  <Button
                    className="w-2/3 lg:w-44 md:w-44 ml-2 mt-2 px-2 py-2 rounded-xl bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-36 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white transition translate duration-500 hover:scale-105"
                    type="button"
                    onClick={() => handleAddAltPlayer(index)} // Call handleAddAltPlayer function with the index of the main player
                  >
                    Legg til alt av{' '}
                    {player.characterName && player.characterName.length > 0
                      ? player.characterName
                      : 'spiller ' + (index + 1)}
                  </Button>
                </div>
              </div>
            ))}
            {players && players.length >= 7 ? (
              <p className="text-white mb-4">Du har nådd maks antall spillere (7)</p>
            ) : (
              <button
                className="px-2 py-2 rounded-xl bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 min-w-36 text-center font-bold  text-white hover:from-yellow-500 hover:to-orange-500 hover:via-yellow-600 hover:text-white transition translate duration-500 hover:scale-105"
                type="button"
                onClick={handleAddPlayer}
              >
                Legg til ny spiller
                <PlusCircle className="ml-2 h-6 w-6 inline-block" />
              </button>
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
