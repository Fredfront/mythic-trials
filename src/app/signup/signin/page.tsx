'use client'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { urlForImage } from '../../../../sanity/lib/image'
import { SignupPage, getSignupData } from '@/app/api/signup/getSignupInfo'
import { signIn } from 'next-auth/react'

function Signin() {
  const [signupData, setSignupData] = useState<SignupPage | null>(null)
  useEffect(() => {
    async function fetchSignupData() {
      const data = await getSignupData()
      setSignupData(data)
    }
    fetchSignupData()
  }, [])

  return (
    <div className="w-full flex justify-center lg:mt-20 md:mt-20 mt-5">
      <div className="w-full lg:w-11/12 xl:w-10/12">
        <div className="flex flex-col lg:flex-row md:flex-row">
          <div className="p-4 w-full lg:w-1/2">
            <h1 className="text-4xl font-bold font-sans mb-6 lg:mb-10">Opprett lag</h1>
            <p className="mb-4 lg:mb-6">Du må først logge på for å kunne opprette lag</p>
            <Button className="w-full lg:w-max" onClick={() => signIn('google')}>
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
