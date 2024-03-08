'use client'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { urlForImage } from '../../../../sanity/lib/image'
import { SignupPage, getSignupData } from '@/app/api/signup/getSignupInfo'
import { signIn, useSession } from 'next-auth/react'
import { MythicPlusTeam, getAllTeams } from '@/app/api/getAllTeams'
import { useRouter } from 'next/navigation'

function Signin() {
  const router = useRouter()
  const { data, status } = useSession()
  const [loadingTeams, setLoadingTeams] = useState<boolean>(true)
  const [signupData, setSignupData] = useState<SignupPage | null>(null)
  useEffect(() => {
    async function fetchSignupData() {
      const data = await getSignupData()
      setSignupData(data)
    }
    fetchSignupData()
  }, [])

  const [allTeams, setAllTeams] = useState<MythicPlusTeam[] | null>(null)

  useEffect(() => {
    async function fetchAllTeams() {
      const data = await getAllTeams()
      setAllTeams(data)
      setLoadingTeams(false)
    }
    fetchAllTeams()
  }, [])

  useEffect(() => {
    if (loadingTeams || status === 'loading') return

    if (data && allTeams?.find((e) => e.contactPerson === data.user?.email)) {
      router.prefetch(`/signup/existingTeam/${allTeams.find((e) => e.contactPerson === data.user?.email)?.teamSlug}`)
      router.push(`/signup/existingTeam/${allTeams.find((e) => e.contactPerson === data.user?.email)?.teamSlug}`)
    }

    if (data && !allTeams?.find((e) => e.contactPerson === data.user?.email)) {
      router.prefetch('/signup/createTeam')
      router.push('/signup/createTeam')
    }
  }, [allTeams, data, loadingTeams, router, status])

  return (
    <div className="w-full flex justify-center lg:mt-20 md:mt-20 mt-5">
      <div className="w-full lg:w-11/12 xl:w-10/12">
        <div className="flex flex-col lg:flex-row md:flex-row">
          <div className="p-4 w-full lg:w-1/2">
            <h1 className="text-4xl font-bold  mb-6 lg:mb-10">Opprett lag</h1>
            <p className="mb-4 lg:mb-6">Du må først logge på for å kunne opprette lag</p>
            <Button className="w-full lg:w-max" onClick={() => signIn('google').then}>
              Logg på med Google
            </Button>
          </div>
          <div className="w-full lg:w-1/2 lg:ml-4 p-4 lg:p-0 ">
            <div
              className="bg-cover bg-center bg-no-repeat h-80 lg:h-auto lg:min-h-96 rounded-md"
              style={{ backgroundImage: `url(${urlForImage(signupData?.mainImage.asset._ref as string) as string})` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signin
