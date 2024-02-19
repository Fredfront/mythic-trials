export const DungeonData = {
  type: 'object',
  name: 'DungeonData',
  title: 'Dungeon Data',
  fields: [
    {
      type: 'array',
      name: 'teams',
      title: 'Teams',
      of: [{ type: 'TeamScore' }],
    },
  ],
}
