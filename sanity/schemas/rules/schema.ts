export const RulesPage = {
  name: 'rulesPage',
  title: 'Rules Page',
  type: 'document',
  fields: [
    {
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'The main headline for the front page',
      validation: (Rule: { required: () => any }) => Rule.required(),
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      description: 'The main image displayed on the front page',
    },
    {
      title: 'Content',
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
}
