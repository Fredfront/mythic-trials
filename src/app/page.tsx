import TeamCard from './components/TeamCard'

import { getAllTeams } from './api/getAllTeams'

const allTeams = getAllTeams()
console.log(allTeams)

const Home = () => {
  return (
    <main className="flex flex-col m-auto">
      <h1 className="text-center">Lagene</h1>
      <div className="flex flex-wrap">
        {/* {allTeams.map((team) => (
          <TeamCard key={team._id} teamName={team.teamName} />
        ))} */}
      </div>
    </main>
  )
}

export default Home
