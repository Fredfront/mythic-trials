import React, { useEffect } from 'react'
import Link from 'next/link'
import { UserAuthForm } from './components/user-auth-form'
export default async function Page() {
  return (
    <>
      <div className="container relative h-[800px] flex-col items-center justify-center grid ">
        <div>
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Lag en konto</h1>
              <p className="text-sm text-muted-foreground">Skriv inn din email under for å opprette en konto</p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
