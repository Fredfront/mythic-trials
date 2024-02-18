export async function getTeamData({ teamName }: { teamName: string }) {
  const res = await fetch(`https://raider.io/api/v1/teams/details?region=eu&team=${teamName}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}
