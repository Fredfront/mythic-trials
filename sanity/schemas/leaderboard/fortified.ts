// schemas/fortifiedLeaderboard.js

export const fortifiedLeaderboard = {
  name: 'fortifiedLeaderboard',
  title: 'Fortified Leaderboard',
  type: 'document',
  fields: [
    {
      name: 'dungeon',
      title: 'Dungeon',
      type: 'string',
      options: {
        list: [
          { title: "Dawn of the Infinites: Galakrond's Fall", value: "Dawn of the Infinites: Galakrond's Fall" },
          { title: "Dawn of the Infinites: Murozond's Rise", value: "Dawn of the Infinites: Murozond's Rise" },
          { title: 'Waycrest Manor', value: 'Waycrest Manor' },
          { title: "Atal'Dazar", value: "Atal'Dazar" },
          { title: 'Darkheart Thicket', value: 'Darkheart Thicket' },
          { title: 'Black Rook Hold', value: 'Black Rook Hold' },
          { title: 'Everbloom', value: 'Everbloom' },
          { title: 'Throne of the Tides', value: 'Throne of the Tides' },
        ],
      },
    },
    {
      name: 'teams',
      title: 'Teams',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'team',
              title: 'Team',
              type: 'reference',
              to: [{ type: 'MythicPlusTeam' }],
            },
            {
              name: 'clearTime',
              title: 'Clear Time (in minutes)',
              type: 'number',
            },
            {
              name: 'points',
              title: 'Points',
              type: 'number',
            },
          ],
        },
      ],
    },
  ],
}
