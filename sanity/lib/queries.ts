// ./sanity/lib/queries.ts

import { groq } from 'next-sanity'

export const GET_TEAM_BY_NAME = groq`*[_type == 'MythicPlusTeam' && teamName == $teamName]`
export const GET_ALL_TEAMS = groq`*[_type == 'MythicPlusTeam' || _id in *[_type == 'MythicPlusTeam' && _id match '*-drafts']._id]`
