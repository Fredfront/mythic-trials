'use client'
import { useGetUserData } from '@/app/auth/useGetUserData'
import { useRouter } from 'next/navigation'

export function CheckValidEmail(emails: string[]) {
  const router = useRouter()

  const { user, loading } = useGetUserData()
  const invalidEmail = !loading && emails.filter((email) => email !== user?.data.user?.email) ? true : false

  invalidEmail ? router.push('/') : null
}
