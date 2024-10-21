export const QualifierLeaderboard = {
  name: 'qualifierLeaderboard',
  title: 'Qualifier Leaderboard',
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
            title: 'Ara-Kara, City of Echoes',
            value: 'Ara-Kara, City of Echoes',
            id: 'ara-kara-city-of-echoes',
          },
          {
            title: 'City of Threads',
            value: 'City of Threads',
            id: 'city-of-threads',
          },
          { title: '', value: '', id: '' },
          { title: '', value: '', id: '' },
          { title: '', value: '', id: '' },
          { title: '', value: '', id: '' },
          { title: '', value: '', id: '' },
          { title: '', value: '', id: '' },
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
          { title: 'Ara-Kara, City of Echoes', value: '35:00' },
          { title: 'City of Threads', value: '37:00' },
          { title: 'Mists of Tirna Scithe', value: '30:00' },
          { title: 'Grim Batol', value: '36:40' },
          { title: 'The Dawnbreaker', value: '36:00' },
          { title: 'The Necrotic Wake', value: '30:00' },
          { title: 'The Stonevault', value: '33:00' },
          { title: 'Siege of Boralus', value: '34:00' },
        ],
      },
    },
  ],
}
