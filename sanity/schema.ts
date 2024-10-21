import { type SchemaTypeDefinition } from 'sanity'

import { MythicPlusTeam, Player } from './schemas/Teams/Team'
import { FrontPage } from './schemas/frontpage/schema'
import { SignupPage } from './schemas/signup/schema'
import { RulesPage } from './schemas/rules/schema'
import { FrontpageNews } from './schemas/frontpageNews/schema'
import featureToggle from './schemas/featureToggles/schema'
import { QualifierLeaderboard } from './schemas/leaderboard/qualifierLeaderboard'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [MythicPlusTeam, Player, QualifierLeaderboard, FrontPage, SignupPage, RulesPage, FrontpageNews, featureToggle],
}
