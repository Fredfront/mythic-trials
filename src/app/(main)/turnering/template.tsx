'use client'

import { BarChart, Calendar, HomeIcon, Table } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { urlForImage } from '../../../../sanity/lib/image'
import { SignupPage, getSignupData } from '@/app/api/signup/getSignupInfo'
import { useState, useEffect } from 'react'
import {
  Calendar03Icon,
  ChartAverageIcon,
  Home01Icon,
  LeftToRightListBulletIcon,
  ScrollIcon,
  UserGroupIcon,
} from '@/utils/icons/Icons'
import { TracingBeam } from '@/components/ui/tracing-beam'

export default function Template({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [signupData, setSignupData] = useState<SignupPage | null>(null)
  useEffect(() => {
    async function fetchSignupData() {
      const data = await getSignupData()
      setSignupData(data)
    }
    fetchSignupData()
  }, [])

  return (
    <div className="flex max-w-7xl m-auto mt-4  ">
      <div className="sm:w-1/5 sm:flex  hidden md:max-w-[250px] w-full ">
        <ul className="mr-4 text-[1.2rem] mt-4 pl-4 pr-4  lg:ml-0">
          <li
            style={{ color: pathname === '/turnering' ? '#FDB202' : 'white' }}
            className="flex gap-4 hover:font-bold cursor-pointer"
            onClick={() => router.push('/turnering')}
          >
            <Calendar03Icon color="white" /> Kamper
          </li>
          <li
            style={{ color: pathname === '/turnering/tabell' ? '#FDB202' : 'white' }}
            className="flex gap-4 hover:font-bold cursor-pointer"
            onClick={() => router.push('/turnering/tabell')}
          >
            <LeftToRightListBulletIcon color="white" /> Tabell
          </li>
          <li
            style={{ color: pathname === '/turnering/rules' ? '#FDB202' : 'white' }}
            className="flex gap-4 hover:font-bold cursor-pointer"
            onClick={() => router.push('/turnering/rules')}
          >
            <ScrollIcon color="white" /> Regler
          </li>
          <li
            onClick={() => router.push('/turnering/teams')}
            style={{ color: pathname === '/turnering/teams' ? '#FDB202' : 'white' }}
            className="flex gap-4 hover:font-bold cursor-pointer"
          >
            <UserGroupIcon color="white" />
            Lag
          </li>
          {/* <li
            style={{ color: pathname === '/turnering/stats' ? '#FDB202' : 'white' }}
            className="flex gap-4 hover:font-bold cursor-pointer"
          >
            <ChartAverageIcon color="white" /> Statistikk
          </li> */}
        </ul>
      </div>
      <TracingBeam className="px-6 md:ml-6 ">
        <div className=" ml-6 w-ful pr-1 md:w-4/5 mb-4 ">
          <div
            className="bg-cover bg-center bg-no-repeat w-full h-40"
            style={{ backgroundImage: `url(${urlForImage(signupData?.mainImage.asset._ref as string) as string})` }}
          />
          <div className="flex flex-col w-full">{children}</div>
        </div>
      </TracingBeam>
    </div>
  )
}
