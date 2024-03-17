// featureToggle.js

const featureToggle = {
  name: 'featureToggle',
  title: 'Feature Toggle',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Enter the name of the feature toggle.',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Describe what this feature toggle is used for.',
    },
    {
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Toggle to enable or disable the feature.',
    },
  ],
}

export default featureToggle
