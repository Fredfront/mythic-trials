'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'
import { matchDataType } from '../../types'

export type ContextChildren = {
  children: React.ReactNode
}

export const MatchDataContext = createContext({} as MatchDataContextType)
MatchDataContext.displayName = 'MatchDataContext'
export const MatchDataContextOperations = createContext({} as MatchDataOperationsType)
MatchDataContextOperations.displayName = 'MatchDataContextOperations'

export const useMatchData = () => useContext(MatchDataContext)
export const useMatchDataOperations = () => useContext(MatchDataContextOperations)

export type MatchDataContextType = {
  matchData: matchDataType | null
}

export type MatchDataOperationsType = {
  setMatchData: (data: matchDataType | null) => void
}

const MatchDataProvider: React.FunctionComponent<React.PropsWithChildren<ContextChildren>> = ({
  children,
}: React.PropsWithChildren<ContextChildren>) =>
{
  const [ matchData, setMatchData ] = useState<matchDataType | null>(null)

  const MatchDataValues: MatchDataContextType = useMemo(
    () => ({
      matchData,
    }),
    [ matchData ],
  )
  const MatchDataOperations: MatchDataOperationsType = useMemo(
    () => ({
      setMatchData,
    }),
    [],
  )

  return (
    <MatchDataContext.Provider value={MatchDataValues}>
      <MatchDataContextOperations.Provider value={MatchDataOperations}>{children}</MatchDataContextOperations.Provider>
    </MatchDataContext.Provider>
  )
}

export default MatchDataProvider
