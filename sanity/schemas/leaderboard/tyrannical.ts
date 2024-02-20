// schemas/tyrannicalLeaderboard.js

export const TyrannicalLeaderboard = {
  name: 'tyrannicalLeaderboard',
  title: 'Tyrannical Leaderboard',
  type: 'document',
  fields: [
    {
      name: 'dungeon',
      title: 'Dungeon',
      id: 'dungeon',
      type: 'string',
      options: {
        list: [
          {
            title: "Dawn of the Infinites: Galakrond's Fall",
            value: "Dawn of the Infinites: Galakrond's Fall",
            id: 'dawn-of-the-infinites-galakronds-fall',
          },
          {
            title: "Dawn of the Infinites: Murozond's Rise",
            value: "Dawn of the Infinites: Murozond's Rise",
            id: 'dawn-of-the-infinites-murozonds-rise',
          },
          { title: 'Waycrest Manor', value: 'Waycrest Manor', id: 'waycrest-manor' },
          { title: "Atal'Dazar", value: "Atal'Dazar", id: 'ataldazar' },
          { title: 'Darkheart Thicket', value: 'Darkheart Thicket', id: 'darkheart-thicket' },
          { title: 'Black Rook Hold', value: 'Black Rook Hold', id: 'black-rook-hold' },
          { title: 'Everbloom', value: 'Everbloom', id: 'everbloom' },
          { title: 'Throne of the Tides', value: 'Throne of the Tides', id: 'throne-of-the-tides' },
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
              name: 'minutes',
              title: 'Minutes',
              type: 'number',
            },
            {
              name: 'seconds',
              title: 'Seconds',
              type: 'number',
            },
          ],
          preview: {
            select: {
              team: 'team.teamName',
              minutes: 'minutes',
              seconds: 'seconds',
            },
            prepare(selection: { team: any; minutes: any; seconds: any }) {
              const { team, minutes, seconds } = selection
              return {
                title: `${team} (${minutes} min ${seconds}s) `,
              }
            },
          },
        },
      ],
    },
  ],
}
