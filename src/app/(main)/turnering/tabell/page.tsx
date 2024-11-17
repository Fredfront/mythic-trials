import SimplifiedLeaderboard from '@/app/components/SimplifiedLeaderboard'
import { ServerClient } from '@/utils/supabase/server'
import React from 'react'
import ResultsTable from './ResultsTableBo3'
import { getAllTeams } from '@/app/api/getAllTeams'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CalendarX } from 'lucide-react'
import ResultsTableBo3 from './ResultsTableBo3'
import ResultsTableBo2 from './ResultsTableBo2'
import { MatchResult } from '../../../../../types'

export const revalidate = 0

async function Page() {
  const matchResultsTable = (await ServerClient.from('match_results').select('*')).data as MatchResult[] | undefined
  const sanityTeamData = await getAllTeams()

  const isBestOfThree = matchResultsTable?.find((e) => e.bo3 === true) ? true : false
  const isBestOfTwo = matchResultsTable?.find((e) => e.bo2 === true) ? true : false

  if (matchResultsTable && matchResultsTable.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 text-white">
        <Card className="w-full max-w-md text-white">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center text-white">
              <CalendarX color="white" className="mr-2" />
              Ingen tabell tilgjengelig
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-white">
              Det er for øyeblikket ingen tabell tilgjengelig. Vennligst sjekk igjen senere for oppdateringer.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {' '}
      <h1 className="text-4xl font-bold mb-10">Tabell</h1>
      {matchResultsTable && isBestOfTwo && (
        <ResultsTableBo2 matchResults={matchResultsTable} sanityTeamData={sanityTeamData} />
      )}
      {matchResultsTable && isBestOfThree && (
        <ResultsTableBo3 matchResults={matchResultsTable} sanityTeamData={sanityTeamData} />
      )}
    </>
  )
}

export default Page
