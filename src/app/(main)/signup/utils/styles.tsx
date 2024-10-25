import { StylesConfig } from 'react-select'

export const colourStyles: StylesConfig = {
  singleValue: (styles) => ({
    ...styles,
    color: 'white',
    backgroundColor: '#374151',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    marginLeft: '-1rem',
  }),
  input: (styles) => ({
    ...styles,
    color: 'white',
  }),
  valueContainer: (styles) => ({
    ...styles,
    cursor: 'pointer',
    backgroundColor: '#374151',
    color: 'white',
    marginLeft: '1rem',
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: '#374151',
    color: 'white',
    border: 'none',
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: 'rgb(31 41 55 / var(--tw-bg-opacity))',
      color: 'white', // Ensure text color remains white
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':hover': {
        ...styles[':hover'],
        backgroundColor: '#4a5568',
        color: 'white', // Set text color to white on hover
        cursor: 'pointer',
      },
    }
  },
}
