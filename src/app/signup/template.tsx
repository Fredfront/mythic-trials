'use client'
import { SessionProvider } from 'next-auth/react'

export default function Template({ children, session }: { children: React.ReactNode; session: any }) {
  return (
    <SessionProvider session={session}>
      <div>{children}</div>
    </SessionProvider>
  )
}
