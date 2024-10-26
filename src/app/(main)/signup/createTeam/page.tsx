import { getAllTeams } from "@/app/api/getAllTeams"
import CreateTeam from "./CreateTeam"


const page = async () =>
{

  const allTeams = await getAllTeams()


  if (!allTeams) return null

  return (
    <CreateTeam allTeams={allTeams} />
  )
}

export default page