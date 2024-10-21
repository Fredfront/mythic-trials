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

type Props = {
  intitalSchedule: TournamentSchedule

}

const Matches: React.FC<Props> = ({
  intitalSchedule,

}) =>
{
  const [ localSchedule, setLocalSchedule ] = useState<TournamentSchedule>(intitalSchedule)

  // Handle drag and drop
  const onDragEnd = (result: DropResult) =>
  {
    const { source, destination } = result
    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return

    const parseDroppableId = (id: string) => id.split('-').map(Number)
    const [ sourceRound, sourceMatch ] = parseDroppableId(source.droppableId)
    const [ destRound, destMatch ] = parseDroppableId(destination.droppableId)

    // Deep copy schedule ensuring teams remain tuples
    const newSchedule: TournamentSchedule = localSchedule.map((round, roundIndex) =>
      round.map((match, matchIndex) =>
      {
        // Clone the teams as a tuple
        const clonedTeams: [ TeamMatch, TeamMatch ] = [
          { ...match.teams[ 0 ] },
          { ...match.teams[ 1 ] },
        ]
        return { ...match, teams: clonedTeams }
      })
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
      const newMatchUUID = `${teams[ 0 ].team_slug}-${teams[ 1 ].team_slug}-round-${teams[ 0 ].round}-roundDate-${teams[ 0 ].roundDate}`
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
        })
      )
    )
  }

  const handleGenerateRoundRobin = async () =>
  {
    await createRoundRobin(localSchedule)

  }

  return (
    <div className="p-6 bg-[#011624] min-h-screen text-white">
      <Card className="mb-6 bg-[#022B3A]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center">
            <Trophy className="mr-2 text-yellow-500" />
            Tournament Bracket Preview
          </CardTitle>
        </CardHeader>
      </Card>
      <DragDropContext onDragEnd={onDragEnd}>
        <ScrollArea className="w-full">
          <div className="flex space-x-6 pb-4">
            {localSchedule.map((round, roundIndex) => (
              <div key={roundIndex} className="min-w-[300px]">
                <Card className="mb-4 bg-[#022B3A]">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-center">
                      Round {roundIndex + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {round.map((match, matchIndex) =>
                    {
                      const isFeatured = match.featured
                      return (
                        <Droppable
                          key={`${roundIndex}-${matchIndex}`}
                          droppableId={`${roundIndex}-${matchIndex}`}
                          direction="vertical"
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`relative transition-all duration-200 ${isFeatured
                                ? 'border-4 border-yellow-400 shadow-lg'
                                : snapshot.isDraggingOver
                                  ? 'bg-[#014F86] shadow-lg'
                                  : 'bg-[#013D5B]'
                                }`}
                            >
                              {/* Featured Badge */}
                              {isFeatured && (
                                <div className="absolute top-2 right-2">
                                  <Star className="text-yellow-500 w-5 h-5" />
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
                                            ? 'bg-blue-700 text-yellow-300'
                                            : 'bg-red-700 text-red-300'
                                          }`}
                                      >
                                        <span className="font-medium">{team.name}</span>
                                        <span>
                                          {team.home ? (
                                            <Home className="w-4 h-4" />
                                          ) : (
                                            <Plane className="w-4 h-4" />
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {/* Feature Button */}
                                <Button
                                  size="sm"
                                  variant={isFeatured ? 'secondary' : 'outline'}
                                  onClick={() => handleFeatureMatch(roundIndex, matchIndex)}
                                  className={`mt-2 w-full flex items-center justify-center space-x-1 ${isFeatured ? 'bg-yellow-500 text-black' : 'border border-gray-500 text-gray-300'
                                    }`}
                                >
                                  <Star
                                    className={`w-4 h-4 ${isFeatured ? 'text-black' : 'text-gray-400'
                                      }`}
                                  />
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
          onClick={handleGenerateRoundRobin}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Generate Round-robin
        </Button>
      </div>
    </div>
  )
}

export default Matches