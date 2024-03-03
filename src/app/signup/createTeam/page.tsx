'use client'
import { AltPlayer, MythicPlusTeam, getAllTeams, Player } from '@/app/api/getAllTeams'
import { Icons } from '@/components/loading'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { colourStyles } from '../utils/styles'
import { projectId, dataset, apiVersion, token, useCdn } from '../../../../sanity/env'
import { v4 as uuidv4 } from 'uuid'
import Select from 'react-select'
import Image from 'next/image'
import { PlayerInfoImage } from '../components/PlayerInfoImage'
import { useRouter } from 'next/navigation'
import Loading from '../components/Loading'
import { mutateClient } from '../client'
import { wowRealmsMapped } from '../utils/wowRealms'

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

  const hasTeam = allTeams?.find((e) => e.contactPerson === data?.user?.email)
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
    if (file) {
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
      const imageAsset = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (reader.result === null) return
          resolve(new Blob([reader.result], { type: teamImage.type }))
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(teamImage)
      })

      const uploadedImage = await mutateClient.assets.upload('image', imageAsset as any, {
        filename: teamImage.name,
        contentType: teamImage.type,
      })

      setUploadedImage(uploadedImage)
      setImageUploaded(true)
    } catch (error) {
      console.error('Failed to upload image:', error)
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
                _ref: uploadedImage?._id,
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
      const response = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
  }, [players, router, teamName, teamSlug, uploadedImage?._id, userEmail])

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

  if (status === 'loading' || status === 'unauthenticated') return <Loading />

  return (
    hasTeam && (
      <div className="flex justify-center flex-col items-center bg-black text-white py-8">
        <h1 className="text-4xl font-bold font-sans mb-10">Opprett lag</h1>
        <p className="mb-4 pl-4">
          Fyll ut skjemaet under for å opprette laget ditt. Det må være minimum 5 spillere per lag. NB: Husk også å
          legge til eventuelle alts som skal være med i laget.
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
            Team Image:
          </label>
          <input type="file" id="teamImage" onChange={handleFileUpload} accept="image/*" className="mb-4" />
          {missingImageError && teamImage === null && <p className="text-red-500 mb-4">Last opp et bilde for laget.</p>}

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
                    className="bg-red-500 mt-2"
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
                  className="w-1/3 lg:w-44 md:w-44 bg-red-500 mt-2"
                  type="button"
                  onClick={() => handleRemovePlayer(index)}
                  aria-label={`Remove player ${index + 1}`}
                >
                  Fjern spiller {index + 1}
                </Button>
                <Button
                  className="w-2/3 lg:w-44 md:w-44 ml-2 mt-2"
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
            <Button className="mb-4 max-w-52" type="button" onClick={handleAddPlayer}>
              Legg til ny spiller
            </Button>
          )}
          {missingPlayersError && <p className="text-red-500 mb-4">Legg til minst 5 spillere.</p>}

          <Button
            disabled={
              players?.some((e) => e.characterName?.length === 0 || e.realmName?.length === 0) ||
              loadingCreateTeam ||
              teamNameAlreadyExists ||
              teamNameError ||
              (players && players.length <= 4)
            }
            className="mt-10"
            type="submit"
          >
            {players?.some((e) => e.characterName?.length === 0 || e.realmName?.length === 0) ||
            teamNameAlreadyExists ||
            teamNameError ||
            playerErrors.some((e) => e === true) ||
            (players && players.length <= 4)
              ? 'Mangler info for å opprette lag'
              : loadingCreateTeam
                ? 'Opretter lag'
                : 'Opprett lag'}
            {loadingCreateTeam ? <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" /> : null}
          </Button>
        </form>
      </div>
    )
  )
}

export default CreateTeam
