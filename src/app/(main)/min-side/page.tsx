import { getAllTeams } from '@/app/api/getAllTeams'
import MyPage from './MyPage'

const page = async () => {
  const sanityTeams = await getAllTeams()

  return <MyPage sanityTeams={sanityTeams} />
}

export default page
