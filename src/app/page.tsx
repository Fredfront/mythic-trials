import { allTeams } from './api/getAllTeams'
import TeamCard from './components/teamCard'

export default function Home() {
  return (
    <main className=" flex flex-col m-auto">
      <h1 className="text-center">Lagene</h1>
      <div className="flex flex-wrap">
        {allTeams.map((team) => {
          return <TeamCard key={team} teamName={team} />
        })}
      </div>
    </main>
  )
}
