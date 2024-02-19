import { type SchemaTypeDefinition } from 'sanity'

import { Affixes } from './schemas/Affixes'
import { TeamScore } from './schemas/TeamScore'
import { WeekData } from './schemas/WeekData'
import { DungeonData } from './schemas/DungeonData'
import { MythicPlusTeam, Player } from './schemas/Teams/Team'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [MythicPlusTeam, Player, Affixes, WeekData, DungeonData, TeamScore],
}
