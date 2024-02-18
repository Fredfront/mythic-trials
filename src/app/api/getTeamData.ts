export async function getTeamData({ teamName }: { teamName: string }) {
  const res = await fetch(`https://raider.io/api/teams/details?region=eu&team=${teamName}`)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}
