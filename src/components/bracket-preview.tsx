// src/components/BracketPreview.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trophy, Home, Plane, Star } from 'lucide-react'
import { createRoundRobin } from '@/app/(main)/superadmin/components/CreateRoundRobin'
import { TeamMatch, TournamentSchedule } from '../../types'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Checkbox } from './ui/checkbox'

type Props = {
  intitalSchedule: TournamentSchedule
  schedule: TournamentSchedule
}

const Matches: React.FC<Props> = ({ intitalSchedule }) =>
{
  const [ localSchedule, setLocalSchedule ] = useState<TournamentSchedule>(intitalSchedule)
  const [ bracketsCreated, setBracketsCreated ] = useState(false)
  const [ isBo2, setIsBo2 ] = React.useState(true)
  const [ isBo3, setIsBo3 ] = React.useState(false)
  const [ tournamentName, setTournamentName ] = React.useState('')

  // Handle drag and drop
  const onDragEnd = (result: DropResult) =>
  {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const parseDroppableId = (id: string) => id.split('-').map(Number)
    const [ sourceRound, sourceMatch ] = parseDroppableId(source.droppableId)
    const [ destRound, destMatch ] = parseDroppableId(destination.droppableId)

    // Deep copy schedule ensuring teams remain tuples
    const newSchedule: TournamentSchedule = localSchedule.map((round) =>
      round.map((match) =>
      {
        // Clone the teams as a tuple
        const clonedTeams: [ TeamMatch, TeamMatch ] = [ { ...match.teams[ 0 ] }, { ...match.teams[ 1 ] } ]
        return { ...match, teams: clonedTeams }
      }),
    )

    // Swap the teams between source and destination
    const draggedTeam = newSchedule[ sourceRound ][ sourceMatch ].teams[ source.index ]
    const targetTeam = newSchedule[ destRound ][ destMatch ].teams[ destination.index ]

    newSchedule[ destRound ][ destMatch ].teams[ destination.index ] = {
      ...draggedTeam,
      home: destination.index === 0,
    }

    newSchedule[ sourceRound ][ sourceMatch ].teams[ source.index ] = {
      ...targetTeam,
      home: source.index === 0,
    }

    const updateMatchUUID = (round: number, match: number) =>
    {
      const teams = newSchedule[ round ][ match ].teams
      const newMatchUUID = `${teams[ 0 ].team_slug}-${teams[ 1 ].team_slug}-round-${teams[ 0 ].round}`
      newSchedule[ round ][ match ].teams[ 0 ].matchUUID = newMatchUUID
      newSchedule[ round ][ match ].teams[ 1 ].matchUUID = newMatchUUID
    }

    updateMatchUUID(sourceRound, sourceMatch)
    updateMatchUUID(destRound, destMatch)

    setLocalSchedule(newSchedule)
  }

  // Handler to feature a match
  const handleFeatureMatch = (roundIndex: number, matchIndex: number) =>
  {
    setLocalSchedule((prevSchedule) =>
      prevSchedule.map((round, rIndex) =>
        round.map((match, mIndex) =>
        {
          if (rIndex === roundIndex) {
            return {
              ...match,
              featured: mIndex === matchIndex ? !match.featured : false,
            }
          }
          return match
        }),
      ),
    )
  }

  const handleGenerateRoundRobin = async () =>
  {
    await createRoundRobin(localSchedule, isBo2, isBo3, tournamentName).then((res) =>
    {
      if (res.status === 200) setBracketsCreated(true)
    })
  }

  if (bracketsCreated) {
    return (
      <div className="p-6 bg-[#011624] min-h-screen text-white">
        <Card className="mb-6 bg-[#022B3A] text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center flex items-center justify-center">
              <Trophy className="mr-2 text-yellow-500" />
              Tournament Bracket Preview
            </CardTitle>
          </CardHeader>
        </Card>
        <div className="flex justify-center items-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center text-white">
                <Trophy className="mr-2" />
                Tournament Brackets Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-white text-sm">
                The tournament brackets have been successfully created. You can now view the tournament brackets in the
                tournament page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white max-w-7xl m-auto ">
      <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center">
            <Trophy className="mr-2 text-yellow-400 h-8 w-8" />
            Tournament Bracket Preview
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="tournamentName" className="text-sm font-medium text-gray-300">
                Tournament Name
              </Label>
              <Input
                id="tournamentName"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value.trim())}
                placeholder="Enter tournament name"
              />
            </div>
            <div className="flex space-x-4 items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bo2"
                  checked={isBo2}
                  onCheckedChange={() =>
                  {
                    setIsBo2(!isBo2)
                    setIsBo3(false)
                  }}
                />
                <Label htmlFor="bo2" className="text-sm font-medium text-gray-300">
                  Best of 2
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bo3"
                  checked={isBo3}
                  onCheckedChange={() =>
                  {
                    setIsBo3(!isBo3)
                    setIsBo2(false)
                  }}
                />
                <Label htmlFor="bo3" className="text-sm font-medium text-gray-300">
                  Best of 3
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <DragDropContext onDragEnd={onDragEnd}>
        <ScrollArea >
          <div className='flex gap-4 flex-wrap' >
            {localSchedule.map((round, roundIndex) => (
              <div key={roundIndex} className="w-auto">
                <Card className="mb-4 bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold text-center text-blue-400">
                      Round {roundIndex + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    {round.map((match, matchIndex) =>
                    {
                      const isFeatured = match.featured
                      return (
                        <Droppable key={`${roundIndex}-${matchIndex}`} droppableId={`${roundIndex}-${matchIndex}`} direction="vertical">
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`relative transition-all duration-200 ${isFeatured
                                ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 border-2 border-yellow-400 shadow-lg'
                                : snapshot.isDraggingOver
                                  ? 'bg-blue-700 shadow-lg'
                                  : 'bg-gray-700'
                                }`}
                            >
                              {isFeatured && (
                                <div className="absolute top-2 right-2">
                                  <Star className="text-yellow-400 w-5 h-5" />
                                </div>
                              )}
                              <CardContent className="space-y-2 p-3">
                                {match.teams.map((team, teamIndex) => (
                                  <Draggable
                                    key={`${roundIndex}-${matchIndex}-${teamIndex}-${team.matchUUID}`}
                                    draggableId={`${roundIndex}-${matchIndex}-${teamIndex}-${team.matchUUID}`}
                                    index={teamIndex}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`p-3 rounded-md shadow-sm text-sm cursor-move flex items-center justify-between ${snapshot.isDragging
                                          ? 'bg-blue-500 text-white'
                                          : team.home
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                            : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                                          }`}
                                      >
                                        <span className="font-medium">{team.name}</span>
                                        <span>
                                          {team.home ? (
                                            <Home className="w-4 h-4 text-yellow-400" />
                                          ) : (
                                            <Plane className="w-4 h-4 text-gray-300" />
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                <Button
                                  size="sm"
                                  onClick={() => handleFeatureMatch(roundIndex, matchIndex)}
                                  className={`mt-2 w-full flex items-center justify-center space-x-1 ${isFeatured
                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                                    }`}
                                >
                                  <Star className={`w-4 h-4 ${isFeatured ? 'text-gray-900' : 'text-gray-300'}`} />
                                  <span>{isFeatured ? 'Featured' : 'Feature'}</span>
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </Droppable>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DragDropContext>
      <div className="mt-6 text-center">
        <Button
          disabled={!tournamentName || (!isBo2 && !isBo3)}
          onClick={handleGenerateRoundRobin}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Generate Round-robin
        </Button>
      </div>
    </div>
  )
}

export default Matches
