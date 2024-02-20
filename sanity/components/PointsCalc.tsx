export const CustomPointsCalculator = ({ clearTime }: any) => {
  const baseTimer = 30

  const calculatePoints = (clearTime: any) => {
    const timeDifference = baseTimer - clearTime
    const points = Math.max(0, timeDifference)
    return points
  }

  return <div>Points: {calculatePoints(clearTime)}</div>
}
