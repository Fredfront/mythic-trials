interface ToggleProps {
  value: boolean
  onChange: (value: boolean) => void
}

// Custom input component for toggle switch
const ToggleSwitch: React.FC<ToggleProps> = ({ value, onChange }) => (
  <div className="toggle-switch">
    <input type="checkbox" id="showOnFrontpage" checked={value} onChange={(e) => onChange(e.target.checked)} />
    <label htmlFor="showOnFrontpage" className="switch-label">
      <span className="switch-inner" />
      <span className="switch-switch" />
    </label>
  </div>
)

export const FrontpageNews = {
  name: 'frontpageNews',
  title: 'Frontpage News',
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
      name: 'showOnFrontpage',
      title: 'Show post on frontpage?',
      type: 'boolean',
      description: 'Toggle to show or hide this news article on the frontpage',
      validation: (Rule: { required: () => any }) => Rule.required(),
      options: {
        layout: 'checkbox', // Display as a checkbox for clearer indication
      },
      inputComponent: ToggleSwitch, // Custom input component for toggle switch
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
