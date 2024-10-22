import SimplifiedLeaderboard from '@/app/components/SimplifiedLeaderboard'
import { ServerClient } from '@/utils/supabase/server'
import React from 'react'
import ResultsTable from './ResultsTable'
import { getAllTeams } from '@/app/api/getAllTeams'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CalendarX } from 'lucide-react'

export const revalidate = 0

async function Page() {
  const matchResultsTable = await ServerClient.from('match_results').select('*')
  const sanityTeamData = await getAllTeams()

  if (matchResultsTable.data && matchResultsTable.data.length === 0) {
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

  return <ResultsTable matchResults={matchResultsTable.data ?? []} sanityTeamData={sanityTeamData} />
}

export default Page
