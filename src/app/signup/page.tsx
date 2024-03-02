'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/loading'
import { projectId, dataset, apiVersion, useCdn, token } from '../../../sanity/env'
import { createClient } from '@sanity/client'
import Image from 'next/image'
import { SignupPage, getSignupData } from '../api/signup/getSignupInfo'
import { urlForImage } from '../../../sanity/lib/image'
import { AltPlayer, MythicPlusTeam, Player, getAllTeams } from '../api/getAllTeams'

import { getRaiderIOCharacerData } from '../api/getCharacerData'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { revalidatePath } from 'next/cache'
import wowRealms from './wow-realms.json'

import Select, { StylesConfig } from 'react-select'
import _ from 'lodash'

const wowRealmsMapped = wowRealms.Realms.map((realm) => {
  return { name: realm.name, label: realm.name }
})

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  token,
})
function CreateMythicPlusTeam() {
  const { data, status } = useSession()
  const [teamName, setTeamName] = useState('')
  const [teamImage, setTeamImage] = useState<any>(null)
  const [players, setPlayers] = useState<{ characterName: string; realmName: string; alts?: AltPlayer[] }[]>([
    { characterName: '', realmName: '', alts: [] },
  ])

  console.log(players)

  const [hasEditedPlayers, setHasEditedPlayers] = useState(false)
  const [allTeams, setAllTeams] = useState<MythicPlusTeam[] | null>(null)
  const [signupData, setSignupData] = useState<SignupPage | null>(null)
  const [previewImage, setPreviewImage] = useState<any>(null)

  // State for input field errors
  const [teamNameError, setTeamNameError] = useState(false)
  const [playerErrors, setPlayerErrors] = useState<boolean[]>([])
  const [uploadedImage, setUploadedImage] = useState<any>(null)
  const [imageUploaded, setImageUploaded] = useState(false)
  const [missingImageError, setMissingImageError] = useState(false)
  const [missingPlayersError, setMissingPlayersError] = useState(false)
  const [teamHasBeenCreated, setTeamHasBeenCreated] = useState(false)
  const [loadingCreateTeam, setLoadingCreateTeam] = useState(false)
  const [editTeam, setEditTeam] = useState(false)
  const [teamHasBeenUpdated, setTeamHasBeenUpdate] = useState(false)
  const [teamNameAlreadyExists, setTeamNameAlreadyExists] = useState(false)

  useEffect(() => {
    async function fetchAllTeams() {
      const data = await getAllTeams()
      setAllTeams(data)
    }
    fetchAllTeams()
  }, [])

  useEffect(() => {
    async function fetchSignupData() {
      const data = await getSignupData()
      setSignupData(data)
    }
    fetchSignupData()
  }, [])

  // State for image preview

  const handlePlayerChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target

    setPlayers((prevPlayers) => prevPlayers.map((player, i) => (i === index ? { ...player, [name]: value } : player)))

    setHasEditedPlayers(true)
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

    setHasEditedPlayers(true)
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

      const uploadedImage = await client.assets.upload('image', imageAsset as any, {
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

    try {
      const mutations = [
        {
          createOrReplace: {
            _type: 'MythicPlusTeam',
            _id: `drafts.${uuidv4()}`,
            _key: uuidv4(),
            teamName,
            contactPerson: data?.user?.email,
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
          setTeamHasBeenCreated(true)
          setLoadingCreateTeam(false)
          revalidatePath('/signup')
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
  }, [data?.user?.email, players, teamName, uploadedImage?._id])

  useEffect(() => {
    if (imageUploaded) {
      createMythicPlusTeam()
      setImageUploaded(false)
    }
  }, [createMythicPlusTeam, imageUploaded])

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
            setTeamHasBeenUpdate(true)
            setLoadingCreateTeam(false)
            revalidatePath('/signup')
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
    },
    [allTeams, data?.user?.email, players],
  )

  useEffect(() => {
    if (editTeam && allTeams?.find((e) => e.contactPerson === data?.user?.email)?.teamName) {
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
  }, [allTeams, data?.user?.email, editTeam])

  if (teamHasBeenCreated || teamHasBeenUpdated) {
    return (
      <div className="w-full grid place-content-center items-center h-screen">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold font-sans mb-10">
            {teamHasBeenCreated ? 'Laget ditt er opprettet!' : null}{' '}
            {teamHasBeenUpdated ? 'Laget ditt er blitt oppdatert' : null}{' '}
          </h1>
          <p>
            {teamHasBeenCreated
              ? 'En av våre administratorer vil gå over laget, og godkjenne det før det blir synlig på sidene våre.'
              : null}{' '}
          </p>
        </div>
      </div>
    )
  }
  //LOADING
  if (status === 'loading')
    return (
      <div className="w-full grid place-content-center items-center h-screen">
        <div className="flex">
          Autentiserer bruker <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" />
        </div>
      </div>
    )
  //SHOW EXISTING TEAM
  if (allTeams && allTeams.find((e) => e.contactPerson === data?.user?.email && !editTeam)) {
    return (
      <div className="w-full flex justify-center text-center ">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold font-sans mb-4">Du har allerede opprettet et lag</h1>
          <p className="mb-10">NB! Det kan ta noen minutter før endringene er synlig på denne siden.</p>
          <p className="font-bold mb-4 text-3xl">
            Lagnavn: {allTeams.find((e) => e.contactPerson === data?.user?.email)?.teamName}
          </p>
          <h2 className=" font-poppins font-bold">MAINS</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 place-content-center text-center ">
            {allTeams
              .find((e) => e.contactPerson === data?.user?.email)
              ?.players.map((player, index) => <PlayerInfo key={index} player={player} />)}
          </div>
          <h2 className=" font-poppins font-bold">ALTS</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 place-content-center text-center ">
            {allTeams
              .find((e) => e.contactPerson === data?.user?.email)
              ?.players.map((player, index) =>
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
          <Button onClick={() => setEditTeam(true)} className="mt-4 mb-4">
            Legg til eller fjern spillere
          </Button>
        </div>
      </div>
    )
  }
  //EDIT TEAM FORM
  if (editTeam) {
    return (
      <div className="flex justify-center flex-col items-center bg-black text-white py-8">
        <h1 className="text-4xl font-bold font-sans mb-10">Oppdater ditt lag</h1>

        <form className="flex flex-col w-full p-4 lg:w-2/4  bg-slate-900 rounded-lg " onSubmit={updateMythicPlusTeam}>
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
            <span className="font-bold text-lg">Lagnavn: </span>(Om du ønsker endre lagnavn, ta kontakt med en
            administrator)
          </label>
          <input
            id="teamName"
            name="teamName"
            type="text"
            placeholder="Lagnavn"
            className="rounded-lg p-2 mb-4 w-full lg:w-1/2 bg-gray-800 text-white"
            readOnly
            value={teamName}
          />
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
                  Legg til alt av {player.characterName}
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
          {players && players.length ? players.length : null} av 7 spillere lagt til.
          <Button
            disabled={
              players?.some((e) => e.characterName?.length === 0 || e.realmName?.length === 0) ||
              loadingCreateTeam ||
              (players && players.length <= 4) ||
              !hasEditedPlayers
            }
            className="mt-10"
            type="submit"
          >
            {players?.some((e) => e.characterName?.length === 0 || e.realmName?.length === 0) ||
            teamNameError ||
            playerErrors.some((e) => e === true) ||
            (players && players.length <= 4) ||
            !hasEditedPlayers
              ? 'Mangler info for å oppdatere lag'
              : loadingCreateTeam
                ? 'Oppdaterer lag'
                : 'Oppdater lag'}
            {loadingCreateTeam ? <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" /> : null}
          </Button>
        </form>
      </div>
    )
  }
  //NEW TEAM FORM
  if (status === 'authenticated') {
    return (
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
          <Button
            className="mb-4 max-w-40"
            disabled={players && players.length === 7}
            type="button"
            onClick={handleAddPlayer}
          >
            Legg til ny spiller
          </Button>
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
  } else {
    //CREATE TEAM LOGIN // AUTH WITH GOOGLE
    return (
      <div className="w-full flex justify-center lg:mt-20 md:mt-20 mt-5">
        <div className="w-full lg:w-11/12 xl:w-10/12">
          <div className="flex flex-col lg:flex-row md:flex-row">
            <div className="p-4 w-full lg:w-1/2">
              <h1 className="text-4xl font-bold font-sans mb-6 lg:mb-10">Opprett lag</h1>
              <p className="mb-4 lg:mb-6">Du må først logge på for å kunne opprette lag</p>
              <Button className="w-full lg:w-max" onClick={() => signIn('google')}>
                Logg på med Google
              </Button>
            </div>
            <div className="w-full lg:w-1/2 lg:ml-4 p-4 lg:p-0 ">
              <div
                className="bg-cover bg-center bg-no-repeat h-80 lg:h-auto lg:min-h-96 rounded-md"
                style={{ backgroundImage: `url(${urlForImage(signupData?.mainImage.asset._ref as string) as string})` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CreateMythicPlusTeam

type ExtendedPlayer = {
  characterName: string
  realmName: string
  altOf?: string
}

const PlayerInfo = ({ player }: { player: ExtendedPlayer }) => {
  const [playerInfo, setPlayerInfo] = useState<any>(null)

  useEffect(() => {
    async function fetchPlayerInfo() {
      const data = await getRaiderIOCharacerData({ characterName: player.characterName, realmName: player.realmName })
      setPlayerInfo(data)
    }
    fetchPlayerInfo()
  }, [player.characterName, player.realmName])

  return (
    <div className="flex flex-col items-center mb-2 mt-2">
      <Avatar className="mr-1">
        <AvatarImage src={playerInfo?.thumbnail_url} alt="" />
      </Avatar>
      <p className="">{player.characterName}</p>
      <p className="m-0 text-xs">{player.realmName}</p>
      {player.altOf && <p className="m-0 text-xs">Alt av: {player.altOf}</p>}
    </div>
  )
}

const colourStyles: StylesConfig = {
  singleValue: (styles) => ({
    ...styles,
    color: 'white',
    backgroundColor: 'rgb(31 41 55 / var(--tw-bg-opacity))',
  }),
  input: (styles) => ({
    ...styles,
    color: 'white',
  }),
  valueContainer: (styles) => ({
    ...styles,
    cursor: 'pointer',
    backgroundColor: 'rgb(31 41 55 / var(--tw-bg-opacity))',
    color: 'white',
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: 'rgb(31 41 55 / var(--tw-bg-opacity))',
    color: 'white',
    border: 'none',
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: 'rgb(31 41 55 / var(--tw-bg-opacity))',
      color: 'white', // Ensure text color remains white
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':hover': {
        ...styles[':hover'],
        backgroundColor: '#4a5568',
        color: 'white', // Set text color to white on hover
        cursor: 'pointer',
      },
    }
  },
}
const PlayerInfoImage = ({ player }: { player: Player }) => {
  const [playerInfo, setPlayerInfo] = useState<any>(null)

  useEffect(() => {
    const fetchPlayerInfo = _.debounce(async () => {
      const data = await getRaiderIOCharacerData({ characterName: player.characterName, realmName: player.realmName })
      setPlayerInfo(data)
    }, 500)

    fetchPlayerInfo() // Immediately fetch player info on component mount

    return () => {
      // Cleanup function to cancel any pending fetch requests if component unmounts
      fetchPlayerInfo.cancel()
    }
  }, [player.characterName, player.realmName])

  return (
    <div>
      <Avatar className=" rounded-r-lg rounded-l-none">
        <AvatarImage className="rounded-none" src={playerInfo?.thumbnail_url} alt="" />
      </Avatar>
    </div>
  )
}
