import { getAllTeams } from '@/app/api/getAllTeams'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { urlForImage } from '../../../../../sanity/lib/image'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Scroll, Users } from 'lucide-react'

async function Teams()
{
  const allTeams = await getAllTeams()

  if (allTeams && allTeams.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 text-white">
        <Card className="w-full max-w-md text-white">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center text-white">
              <Users color="white" className="mr-2" />
              Ingen lag funnet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-white">
              Det er for øyeblikket ingen påmeldte lag. Vennligst sjekk igjen senere for oppdateringer.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4 w-full mt-4  ">
      {allTeams.map((team) => (
        <Link prefetch={true} href={`/team/${team.teamSlug}`} key={team._id} className="w-full">
          <div
            key={team._key}
            className="p-4 flex rounded-md bg-[#021F33] text-white  hover:bg-slate-500 cursor-pointer items-center min-w-80 "
          >
            <Image
              src={urlForImage(team.teamImage.asset._ref as any)}
              alt={team.teamName}
              className="rounded-full mr-4  h-14 w-14 "
              width={300}
              height={300}
            />
            <div className="text-xl font-extrabold text-white">{team.teamName}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default Teams
