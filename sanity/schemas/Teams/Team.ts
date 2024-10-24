export const MythicPlusTeam = {
  type: 'document',
  name: 'MythicPlusTeam',
  title: 'Mythic Plus Team',
  fields: [
    {
      type: 'string',
      name: 'teamName',
      title: 'Team Name',
      description: 'The name of the Mythic Plus team',
      validation: (Rule: { required: () => any }) => Rule.required(),
    },
    {
      type: 'string',
      name: 'contactPerson',
      title: 'Contact Person',
      description: 'Email of contact person for the Mythic Plus team',
      validation: (Rule: { required: () => any }) => Rule.required(),
    },
    {
      type: 'string',
      name: 'teamSlug',
      title: 'Team Slug',
      description: 'The slug for the Mythic Plus team (used in URLs)',
      validation: (Rule: { required: () => any }) => Rule.required(),
      options: {
        source: 'teamName',
        maxLength: 200,
        slugify: (input: string) => input.toLowerCase().replace(/\s+/g, '-').slice(0, 200),
      },
    },
    {
      type: 'image',
      name: 'teamImage',
      title: 'Team Image',
      description: 'Image representing the Mythic Plus team',
      validation: (Rule: { required: () => any }) => Rule.required(),
    },
    {
      type: 'array',
      name: 'players',
      title: 'Players',
      of: [{ type: 'Player' }],
      validation: (Rule: {
        required: () => any
        max: (arg0: number) => { (): any; new (): any; warning: { (arg0: string): any; new (): any } }
      }) => [Rule.required(), Rule.max(7).warning('Maximum 7 players allowed per team')],
    },
  ],
}

export const Player = {
  type: 'object',
  name: 'Player',
  title: 'Player',
  fields: [
    {
      type: 'string',
      name: 'characterName',
      title: 'Character Name',
      description: 'The name of the player character',
      validation: (Rule: { required: () => any }) => Rule.required(),
    },
    {
      type: 'string',
      name: 'realmName',
      title: 'Realm Name',
      description: 'The name of the realm for the player character',
      validation: (Rule: { required: () => any }) => Rule.required(),
    },
    {
      type: 'string',
      name: 'discordName',
      title: 'Discord Name',
      description: 'The Discord name of the player',
      validation: (Rule: { required: () => any }) => Rule.required(),
    },
    {
      type: 'string',
      name: 'twitchChannel',
      title: 'Twitch Channel',
      description: 'The Twitch channel of the player',
      validation: (Rule: { required: () => any }) => Rule.required(),
    },
    {
      type: 'array',
      name: 'alts',
      title: 'Alts',
      of: [
        {
          type: 'object',
          fields: [
            {
              type: 'string',
              name: 'altCharacterName',
              title: 'Alt Character Name',
              description: 'The name of the alt character',
              validation: (Rule: { required: () => any }) => Rule.required(),
            },
            {
              type: 'string',
              name: 'altRealmName',
              title: 'Alt Realm Name',
              description: 'The name of the realm for the alt character',
              validation: (Rule: { required: () => any }) => Rule.required(),
            },
          ],
        },
      ],
      description: 'Other characters (players) of the player',
    },
  ],
  preview: {
    select: {
      title: 'characterName',
      subtitle: 'realmName',
    },
  },
}
