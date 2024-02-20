import { type SchemaTypeDefinition } from 'sanity'

import { MythicPlusTeam, Player } from './schemas/Teams/Team'
import { TyrannicalLeaderboard } from './schemas/leaderboard/tyrannical'
import { fortifiedLeaderboard } from './schemas/leaderboard/fortified'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [MythicPlusTeam, Player, TyrannicalLeaderboard, fortifiedLeaderboard],
}
