import { type SchemaTypeDefinition } from 'sanity'

import { MythicPlusTeam, Player } from './schemas/Teams/Team'
import { TyrannicalLeaderboard } from './schemas/leaderboard/tyrannical'
import { FortifiedLeaderboard } from './schemas/leaderboard/fortified'
import { FrontPage } from './schemas/frontpage/schema'
import { SignupPage } from './schemas/signup/schema'
import { RulesPage } from './schemas/rules/schema'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [MythicPlusTeam, Player, TyrannicalLeaderboard, FortifiedLeaderboard, FrontPage, SignupPage, RulesPage],
}
