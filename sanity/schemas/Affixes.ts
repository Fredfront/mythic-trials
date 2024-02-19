import { generateWeeksFields } from './schemaHelpers'

export const Affixes = {
  type: 'document',
  name: 'MythicPlusLeaderboard',
  title: 'Mythic Plus Leaderboard',
  fields: [
    {
      type: 'object',
      name: 'tyrannical',
      title: 'Tyrannical Affix',
      fields: generateWeeksFields(),
    },
    {
      type: 'object',
      name: 'fortified',
      title: 'Fortified Affix',
      fields: generateWeeksFields(),
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare(selection: { title: string }) {
      return {
        title: selection.title,
      }
    },
  },
}
