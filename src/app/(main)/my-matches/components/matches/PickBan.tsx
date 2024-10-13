'use client'
import { Button } from '@/components/ui/button'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import supabase from '@/utils/supabase/client'
import { dungeonConfig } from '../../../turnering/utils/dungeonConfig'
import { TMatchData } from '../../../turnering/components/Matches'
import { PickAndBansType } from '../Matches'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

function PickBan({
  matchData,
  pickAndBansTable,
  contact_person,
}: {
  matchData: TMatchData[]
  pickAndBansTable: PickAndBansType[]
  contact_person: string
})
{
  const searchParams = useSearchParams()
  const homeTeam = searchParams.get('home')
  const awayTeam = searchParams.get('away')

  const round = matchData?.[ 0 ].round
  const opponentTeam = matchData?.find((match) => match.contactPerson === undefined)?.team_slug

  const myPickAndBansTable = pickAndBansTable.find((e) => e.contact_person === contact_person && e.round === round)

  const opponentPickAndBansTable = pickAndBansTable.find((e) => e.team_slug === opponentTeam && e.round === round)

  const [ myTeamData, setMyTeamData ] = useState<PickAndBansType | undefined>(myPickAndBansTable)
  const [ opponentData, setOpponentData ] = useState<PickAndBansType | undefined>(opponentPickAndBansTable)

  const [ teamReady, setTeamReady ] = useState(!!myPickAndBansTable)
  const [ opponentReady, setOpponentReady ] = useState(!!opponentData?.ready)

  const [ mySelectedDungeon, setMySelectedDungeon ] = useState<number | null>(null)

  const isMyTurn = myTeamData?.my_turn === true ? true : false



  useEffect(() =>
  {
    async function fetchData()
    {
      await supabase.from('pick_ban')
        .update({ my_turn: true })
        .eq('contact_person', contact_person)
        .eq('round', round)
    }
    if (opponentData?.my_turn === false && myTeamData?.my_turn === false) {
      fetchData()
    }

  }, [ contact_person, myTeamData?.my_turn, opponentData?.my_turn, round ])

  useEffect(() =>
  {
    if (myTeamData?.ready !== teamReady) {
      setTeamReady(myTeamData?.ready === true ? true : false)
    }
  }, [ teamReady, myTeamData ])

  useEffect(() =>
  {
    if (opponentData?.ready !== opponentReady) {
      setOpponentReady(!!opponentData?.ready)
    }
  }, [ opponentData, opponentReady ])

  useEffect(() =>
  {
    async function fetchData()
    {
      const { data: myTeamData, error } = await supabase
        .from('pick_ban')
        .select()
        .eq('contact_person', contact_person)
        .eq('round', round)

      setMyTeamData(myTeamData?.[ 0 ])
    }
    fetchData()
  }, [ contact_person, round ])

  useEffect(() =>
  {
    async function fetchData()
    {
      const { data: opponentData, error } = await supabase
        .from('pick_ban')
        .select()
        .eq('team_slug', opponentTeam)
        .eq('round', round)

      setOpponentData(opponentData?.[ 0 ])
    }
    fetchData()
  }, [ opponentTeam, round ])

  useEffect(() =>
  {
    if (myTeamData?.pick) {
      setMySelectedDungeon(myTeamData?.pick)
    }
  }, [ myTeamData ])

  async function setReady()
  {
    if (contact_person === undefined) return
    await supabase
      .from('pick_ban')
      .update({ ready: !teamReady })
      .eq('contact_person', contact_person)
      .eq('round', round)
    setTeamReady(!teamReady)
  }



  async function setPickedDungeon(dungeon: number)
  {
    if (contact_person === undefined) return

    await supabase.from('pick_ban').update({ pick: dungeon, my_turn: false }).eq('contact_person', contact_person).eq('round', round)
  }

  const setCompleted = useCallback(async () =>
  {
    if (contact_person === undefined) return

    await supabase.from('pick_ban').update({ completed: true }).eq('contact_person', contact_person).eq('round', round)
  }, [ contact_person, round ])

  async function setBannedDungeons(dungeon: number)
  {
    if (contact_person === undefined) return

    const existingBans = myTeamData?.bans || []
    const newBans = [ ...existingBans, dungeon ]
    await supabase.from('pick_ban').update({ bans: newBans, my_turn: false }).eq('contact_person', contact_person).eq('round', round)
  }

  const pickedDungeons = [ myTeamData?.pick, opponentData?.pick ]

  const mappedBans = myTeamData?.bans?.map((e) => e) || []
  const mappedOpponentBans = opponentData?.bans?.map((e) => e) || []

  const bannedDungeons = [ ...mappedBans, ...mappedOpponentBans ]

  const map1 = myTeamData?.home ? myTeamData.pick : opponentData?.pick
  const map2 = myTeamData?.home ? opponentData?.pick : myTeamData?.pick
  const map3 =
    map1 && map2
      ? dungeonConfig.find(
        (dungeon) => !bannedDungeons.includes(dungeon.id) && dungeon.id !== map1 && dungeon.id !== map2,
      )?.name
      : null

  const map1Name = dungeonConfig.find((dungeon) => dungeon.id === map1)?.name
  const map2Name = dungeonConfig.find((dungeon) => dungeon.id === map2)?.name

  useEffect(() =>
  {
    const channel = supabase
      .channel('pick_ban')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pick_ban',
        },
        (payload) =>
        {
          console.log('Change received!', payload)

          const updatedData = payload.new as PickAndBansType

          if (payload.new.contact_person === contact_person && round === payload.new.round) {
            setMyTeamData(updatedData)
          }

          if (payload.new.team_slug === opponentTeam && round === payload.new.round) {
            setOpponentData(updatedData)
          }

          if (payload.new.team_slug === opponentTeam && payload.new.ready === true) {
            setOpponentReady(true)
          }
        },
      )
      .subscribe()

    return () =>
    {
      supabase.removeChannel(channel)
    }
  }, [ contact_person, opponentTeam, round ])

  const myPicked = myTeamData?.pick
  const opponentPicked = opponentData?.pick

  const banning = myPicked !== null && opponentPicked !== null

  const completed = useMemo(
    () => (pickedDungeons.length === 2 && bannedDungeons.length === 5) || myTeamData?.completed === true,
    [ bannedDungeons.length, myTeamData?.completed, pickedDungeons.length ],
  )

  const pickOrBan = myPicked === null ? 'velge første map du vil spille mot motstander' : 'banne'

  useEffect(() =>
  {
    if (completed && myTeamData?.completed !== true) {
      setCompleted()
    }
  }, [ completed, myTeamData?.completed, setCompleted ])

  useEffect(() =>
  {
    if ((!isMyTurn && mySelectedDungeon) || mySelectedDungeon === myPicked) {
      setMySelectedDungeon(null)
    }
  }, [ isMyTurn, myPicked, mySelectedDungeon ])

  if (completed) {
    return (
      <div className="max-w-7xl m-auto">
        <h1 className="text-center mb-10 text-4xl font-bold mt-10">Pick og Ban er over!</h1>
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="font-bold text-2xl mb-2">Map 1</h3>
            <Image
              width={200}
              height={200}
              className="h-full rounded-lg w-full"
              src={dungeonConfig.find((dungeon) => dungeon.id === map1)?.image ?? ''}
              alt={map1Name ?? ''}
            />
            <h3 className="font-bold text-2xl mt-1">{map1Name}</h3>
          </div>
          <div>
            <h3 className="font-bold text-2xl  mb-2">Map 2</h3>
            <Image
              width={200}
              height={200}
              className="h-full  rounded-lg w-full"
              src={dungeonConfig.find((dungeon) => dungeon.id === map2)?.image ?? ''}
              alt={map2Name ?? ''}
            />
            <h3 className="font-bold text-2xl  mt-1">{map2Name}</h3>
          </div>
          <div>
            <h3 className="font-bold text-2xl  mb-2">Map 3 (Tiebreaker)</h3>
            <Image
              width={200}
              height={200}
              className="h-full  rounded-lg w-full"
              src={dungeonConfig.find((dungeon) => dungeon.name === map3)?.image ?? ''}
              alt={map3 ?? ''}
            />
            <h3 className="font-bold text-2xl  mt-1">{map3}</h3>
          </div>
        </div>
      </div>
    )
  }

  if (!teamReady || !opponentReady) {
    return (
      <>
        <h1 className="text-center mb-10 text-4xl font-bold mt-10">Pick and Ban </h1>
        <h2 className="text-center mb-10 text-4xl font-bold mt-10">Runde: {round}</h2>
        <h3 className="text-center">
          {homeTeam} vs {awayTeam}
        </h3>
        <div className="flex flex-col justify-center gap-10 max-w-7xl text-center m-auto mt-16">
          <Button onClick={setReady} className={`${teamReady ? 'bg-green-600' : ''} max-w-44  m-auto  min-w-44`}>
            Klar
          </Button>

          {opponentReady && !teamReady && <p className="text-green-600">Motstander er klar</p>}

          {teamReady && !opponentReady && <p>Venter på motstander</p>}
        </div>
      </>
    )
  }

  return (
    <div className="mt-10 p-4">
      <div className="text-center ">
        {isMyTurn ? (
          <h2 className="text-4xl font-bold ">Din tur til å {pickOrBan}</h2>
        ) : (
          <h2 className="text-4xl font-bold]">Venter på motstander</h2>
        )}
        <div className='mb-[50px] mt-[25px]'>
          <p>Map 1: {map1Name ?? 'Venter på valg'}</p>
          <p>Map 2: {map2Name ?? 'Venter på valg'}</p>
          <p>Map 3: {bannedDungeons && bannedDungeons.length > 5 ? map3 : 'Venter på valg'}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-10 ">
        {dungeonConfig.map((dungeon) =>
        {
          const backgroundColorPick = 'bg-green-500'
          const backgroundColorBan = 'bg-red-500'
          const isPickedDungeon = pickedDungeons.includes(dungeon.id)
          const isBannedDungeon = bannedDungeons.includes(dungeon.id)

          let backgroundColor = 'bg-gray-500'
          const isPickedBackground = isPickedDungeon ? backgroundColorPick : backgroundColorBan
          const isBannedDungeonBackground = isBannedDungeon ? backgroundColorBan : backgroundColorPick

          if (isPickedDungeon) {
            backgroundColor = isPickedBackground
          }

          if (isBannedDungeon) {
            backgroundColor = isBannedDungeonBackground
          }

          return (
            <div
              onClick={() =>
              {
                if (!isMyTurn || isPickedDungeon || isBannedDungeon) {
                  return
                } else setMySelectedDungeon(dungeon.id)
              }}
              className={`${isMyTurn && mySelectedDungeon === dungeon.id && !isBannedDungeon && !isPickedDungeon ? 'bg-yellow-600' : backgroundColor} relative p-4 text-center :hover:bg-green-600 cursor-pointer rounded-lg`}
              key={dungeon.id}
            >
              <Image width={400} height={400} src={dungeon.image} alt={dungeon.name} className="h-full w-full rounded-lg" />
              <h3 className="absolute inset-0 flex justify-center items-center font-extrabold text-3xl shadow-md">
                {dungeon.name}
              </h3>
            </div>
          )
        })}
      </div>

      {isMyTurn && mySelectedDungeon && (
        <div className="flex mt-10">
          <Button
            className=" m-auto min-w-44"
            onClick={async () =>
            {
              if (myTeamData?.pick === null && mySelectedDungeon) {
                setPickedDungeon(mySelectedDungeon)
              } else {
                mySelectedDungeon ? setBannedDungeons(mySelectedDungeon) : null
              }
            }}
          >
            Bekreft{' '}
            {banning
              ? `ban av ${dungeonConfig.find((e) => e.id === mySelectedDungeon)?.name}`
              : `${dungeonConfig.find((e) => e.id === mySelectedDungeon)?.name} som ditt valg`}
          </Button>
        </div>
      )}
    </div>
  )
}

export default PickBan
