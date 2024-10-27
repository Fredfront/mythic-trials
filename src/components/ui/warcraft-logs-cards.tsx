"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Match, MatchRecord } from "../../../types"
import { TMatchResults } from "@/supabase/dbFunctions"
export default function WarcraftLogsCards({ match, matchResults, index }: { match: Match, matchResults: TMatchResults[], index: number })
{
  const [ activeTab, setActiveTab ] = useState<string>(match.teams[ 0 ].team_slug)

  const homeTeam = match.teams[ 0 ].team_slug
  const awayTeam = match.teams[ 1 ].team_slug

  const getTeamLogs = (teamSlug: string) =>
  {
    return matchResults.find((e) => e.round === index + 1 && teamSlug === e.team_slug)?.warcraft_logs_report || []
  }

  const homeTeamLogs = getTeamLogs(homeTeam)
  const awayTeamLogs = getTeamLogs(awayTeam)

  const MotionCard = motion(Card)

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gray-600 mx-auto"
    >
      <CardHeader className="bg-gray-600">
        <CardTitle className="text-2xl font-bold">Warcraft Logs</CardTitle>
      </CardHeader>
      <CardContent className="bg-gray-600">
        <Tabs className="bg-gray-600" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            {match.teams.map((team) => (
              <TabsTrigger key={team.team_slug} value={team.team_slug}>
                {team.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {match.teams.map((team, teamIndex) => (
            <TabsContent className="bg-gray-600" key={team.team_slug} value={team.team_slug}>
              <h3 className="text-lg font-semibold mb-4">{team.name} Logs</h3>
              <div className="grid grid-cols-2 gap-4">
                {(teamIndex === 0 ? homeTeamLogs : awayTeamLogs).map((link, logIndex) => (
                  <Button
                    key={logIndex}
                    variant="outline"
                    className="w-full justify-between bg-gray-600 transition-colors"
                    asChild
                  >
                    <a
                      href={`https://warcraftlogs.com/reports/${link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center"
                    >
                      <span>Log {logIndex + 1}</span>
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                ))}
              </div>
              {(teamIndex === 0 ? homeTeamLogs : awayTeamLogs).length === 0 && (
                <p className="text-muted-foreground text-center py-4">No logs available for this team.</p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </MotionCard>
  )
}