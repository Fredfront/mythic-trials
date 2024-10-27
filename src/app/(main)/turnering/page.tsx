// src/app/page.tsx

import React from 'react'
import { ServerClient } from '@/utils/supabase/server'
import Matches from './components/Matches'
import { getAllTeams } from '@/app/api/getAllTeams'
import { Team, MatchRecord } from '../../../../types'
import { createSortedRounds } from '../my-matches/page'
import { getLiveStreams, getTwitchAccessToken, TeamLiveStatus } from '@/lib/twitch'

export const revalidate = 1 // Disables ISR; adjust as needed

async function Page()
{
  // Fetch teams
  const teamsResponse = await ServerClient.from('teams').select('*')
  const teams: Team[] = teamsResponse.data ?? []
  // Fetch matches
  const matchesResponse = await ServerClient.from('matches')
    .select('*')
    .order('round', { ascending: true })
    .order('round_startTime', { ascending: true })
  const matchesData = matchesResponse.data as MatchRecord[]
  // Optionally, fetch other tables if needed
  const pickAndBansTable = await ServerClient.from('pick_ban').select('*')
  const matchResultsTable = await ServerClient.from('match_results').select('*')
  const sanityTeamData = await getAllTeams()


  // Extract unique Twitch channels
  const twitchChannels = Array.from(
    new Set(
      sanityTeamData.flatMap((team) =>
        team.players
          .map((player) => player.twitchChannel)
          .filter((channel): channel is string => Boolean(channel))
          .map((channel) => channel.toLowerCase())
      )
    )
  );
  // Get access token
  const accessToken = await getTwitchAccessToken();

  // Get live channels
  const liveChannels = await getLiveStreams(accessToken, twitchChannels);
  // Annotate teams and players with live status
  const teamsWithLiveChannels: TeamLiveStatus[] = sanityTeamData
    .map((team) =>
    {
      const liveChannelsForTeam = team.players
        .map((player) => player.twitchChannel?.toLowerCase())
        .filter(
          (channel): channel is string =>
            channel !== undefined && liveChannels.includes(channel)
        );

      if (liveChannelsForTeam.length === 0) {
        return null; // Exclude teams with no live channels
      }

      return {
        teamSlug: team.teamSlug,
        twitch_channels: Array.from(new Set(liveChannelsForTeam)), // Remove duplicates
      };
    })
    .filter((team): team is TeamLiveStatus => team !== null);


  // const teamsWithLiveChannelsMockData =
  //   [
  //     {
  //       "teamSlug": "live-to-win",
  //       "twitch_channels": [
  //         "fyfaentv"
  //       ]
  //     },
  //     {
  //       "teamSlug": "det-beste-laget",
  //       "twitch_channels": [
  //         "fyfaentv"
  //       ]
  //     },
  //     {
  //       "teamSlug": "test",
  //       "twitch_channels": [
  //         "fyfaentv"
  //       ]
  //     }
  //   ]




  return (
    <Matches
      schedule={createSortedRounds(matchesData, teams)}
      matchResults={matchResultsTable.data ?? []}
      pickAndBanData={pickAndBansTable.data ?? []}
      sanityTeamData={sanityTeamData}
      teamsWithLiveChannels={teamsWithLiveChannels}
    />
  )
}

export default Page
