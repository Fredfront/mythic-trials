// @ts-nocheck
/* eslint-disable react/display-name */
// TimeInputComponent.js
'use client'
import React from 'react'
import { TextInput } from '@sanity/ui'

const TimeInputComponent = React.forwardRef(({ value, onChange }, ref) => {
  const handleChange = (field, fieldValue) => {
    // Ensure fieldValue is a valid number
    fieldValue = parseInt(fieldValue)

    // Ensure fieldValue is within the valid range (0-59)
    fieldValue = fieldValue >= 0 ? (fieldValue <= 59 ? fieldValue : 59) : 0

    // Update the time value based on the changed field
    onChange({
      ...value,
      [field]: fieldValue,
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <TextInput
        value={value.minutes || ''}
        onChange={(event) => handleChange('minutes', event.target.value)}
        ref={ref}
        style={{ width: '50px', marginRight: '5px' }}
      />
      <span style={{ marginRight: '5px' }}>:</span>
      <TextInput
        value={value.seconds || ''}
        onChange={(event) => handleChange('seconds', event.target.value)}
        ref={ref}
        style={{ width: '50px' }}
      />
    </div>
  )
})

export default TimeInputComponent
