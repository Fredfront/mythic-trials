import { type SchemaTypeDefinition } from 'sanity'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    {
      type: 'document',
      name: 'MythicPlusTeam',
      title: 'Mythic Plus Team',
      fields: [
        {
          type: 'string',
          name: 'teamName',
          title: 'Team Name',
          description: 'The name of the Mythic Plus team',
          validation: (Rule: any) => Rule.required(),
        },
        {
          type: 'string',
          name: 'teamSlug',
          title: 'Team Slug',
          description: 'The slug for the Mythic Plus team (used in URLs)',
          validation: (Rule: any) => Rule.required(),
          options: {
            source: 'teamName',
            maxLength: 200, // Adjust maximum length as needed
            slugify: (input: string) => input.toLowerCase().replace(/\s+/g, '-').slice(0, 200),
          },
        },
        {
          type: 'image',
          name: 'teamImage',
          title: 'Team Image',
          description: 'Image representing the Mythic Plus team',
          validation: (Rule: any) => Rule.required(),
        },
        {
          type: 'array',
          name: 'players',
          title: 'Players',
          of: [{ type: 'Player' }],
          validation: (Rule: any) => [Rule.required(), Rule.max(7).warning('Maximum 7 players allowed per team')],
        },
      ],
    },
    {
      type: 'object',
      name: 'Player',
      title: 'Player',
      fields: [
        {
          type: 'string',
          name: 'characterName',
          title: 'Character Name',
          description: 'The name of the player character',
          validation: (Rule: any) => Rule.required(),
        },
        {
          type: 'string',
          name: 'realmName',
          title: 'Realm Name',
          description: 'The name of the realm for the player character',
          validation: (Rule: any) => Rule.required(),
        },
      ],
      preview: {
        select: {
          title: 'characterName',
          subtitle: 'realmName',
        },
      },
    },
  ],
}
