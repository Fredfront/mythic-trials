// schemas/frontPage.js

export const FrontPage = {
  name: 'frontPage',
  title: 'Front Page',
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
      validation: (Rule: { required: () => any }) => Rule.required(),
    },
    {
      name: 'smallTextDescription',
      title: 'Small Text Description',
      type: 'text',
      description: 'A brief description or summary for the front page content',
      rows: 3, // Specify the number of rows for the text area
    },
  ],
}
