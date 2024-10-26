import { getAllTeams } from '@/app/api/getAllTeams'
import EditTeam from './EditTeam'

const page = async () => {
  const allTeams = await getAllTeams()

  if (!allTeams) return null

  return <EditTeam allTeams={allTeams} />
}

export default page
