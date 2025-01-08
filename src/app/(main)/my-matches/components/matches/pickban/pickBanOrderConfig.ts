export const numberOfBansInBestOfTwo = 2
export const numberOfBansInBestOfFive = 5
export const banLength = (isBestOfTwo: boolean) => (isBestOfTwo ? numberOfBansInBestOfTwo : numberOfBansInBestOfFive)

export const stepOrderPickAndBan = ({
  isBestOfTwo,
  homeTeam,
  awayTeam,
}: {
  isBestOfTwo: boolean
  homeTeam: string
  awayTeam: string
}) =>
  isBestOfTwo
    ? [
        { team: awayTeam, action: 'ban', step: 1 },
        { team: homeTeam, action: 'ban', step: 2 },
        { team: awayTeam, action: 'pick', step: 3 },
        { team: homeTeam, action: 'pick', step: 4 },
      ]
    : [
        { team: awayTeam, action: 'ban', step: 1 },
        { team: homeTeam, action: 'ban', step: 2 },
        { team: awayTeam, action: 'pick', step: 3 },
        { team: homeTeam, action: 'pick', step: 4 },
        { team: awayTeam, action: 'ban', step: 5 },
        { team: homeTeam, action: 'ban', step: 6 },
        { team: awayTeam, action: 'ban', step: 7 },
      ]
