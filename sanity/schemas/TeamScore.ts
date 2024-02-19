import TimeInputComponent from '../components/TimeInputComponent'
export const TeamScore = {
  type: 'object',
  name: 'TeamScore',
  title: 'Team Score',
  fields: [
    {
      type: 'reference',
      name: 'teams',
      title: 'Teams',
      to: [{ type: 'MythicPlusTeam' }],
    },
    {
      type: 'object',
      name: 'time',
      title: 'Time',
      fields: [
        {
          type: 'number',
          name: 'minutes',
          title: 'Minutes',
          description: 'Minutes part of the time',
          validation: (Rule: {
            required: () => {
              (): any
              new (): any
              min: { (arg0: number): { (): any; new (): any; max: { (arg0: number): any; new (): any } }; new (): any }
            }
          }) => Rule.required().min(0).max(59), // Minutes should be between 0 and 59
        },
        {
          type: 'number',
          name: 'seconds',
          title: 'Seconds',
          description: 'Seconds part of the time',
          validation: (Rule: {
            required: () => {
              (): any
              new (): any
              min: { (arg0: number): { (): any; new (): any; max: { (arg0: number): any; new (): any } }; new (): any }
            }
          }) => Rule.required().min(0).max(59), // Seconds should be between 0 and 59
        },
      ],
      validation: (Rule: { custom: (arg0: (time: any) => true | 'Time cannot be empty') => any }) =>
        Rule.custom((time: { minutes: any; seconds: any }) => {
          if (!time.minutes && !time.seconds) {
            return 'Time cannot be empty'
          }
          return true
        }),
      inputComponent: TimeInputComponent, // You may need to implement a custom input component for better user experience
    },
  ],

  preview: {
    //add image preview

    select: {
      teamName: 'team.teamName',
      minutes: 'time.minutes',
      seconds: 'time.seconds',
    },
    prepare: ({ teamName, minutes, seconds }: { teamName: any; minutes: any; seconds: any }) => {
      return {
        title: teamName,
        subtitle: `${minutes}m ${seconds}s`,
      }
    },
  },
}
