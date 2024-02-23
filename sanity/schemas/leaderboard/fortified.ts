export const FortifiedLeaderboard = {
  name: 'fortifiedLeaderboard',
  title: 'Fortified Leaderboard',
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
              validation: (Rule: { min: (arg0: number) => any }) => Rule.min(10),
            },
            {
              name: 'seconds',
              title: 'Seconds',
              type: 'number',
              validation: (Rule: {
                min: (arg0: number) => { (): any; new (): any; max: { (arg0: number): any; new (): any } }
              }) => Rule.min(0).max(59),
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
    {
      name: 'baseTimer',
      title: 'Base Timer',
      type: 'string',
      options: {
        list: [
          { title: "Dawn of the Infinites: Galakrond's Fall", value: '35:00' },
          { title: "Dawn of the Infinites: Murozond's Rise", value: '37:00' },
          { title: "Atal'Dazar", value: '30:00' },
          { title: 'Waycrest Manor', value: '36:40' },
          { title: 'Black Rook Hold', value: '36:00' },
          { title: 'Darkheart Thicket', value: '30:00' },
          { title: 'Everbloom', value: '33:00' },
          { title: 'Throne of the Tides', value: '34:00' },
        ],
      },
    },
  ],
}
