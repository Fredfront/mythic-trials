'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import supabase from '@/utils/supabase/client'
import React from 'react'
import { User } from '@supabase/supabase-js'

export default function Template({ children }: { children: React.ReactNode })
{
  const router = useRouter()

  const [ superadmins, setSuperadmins ] = useState<any[]>([])
  const [ user, setUser ] = React.useState<User | null>(null)
  const [ loading, setLoading ] = useState<boolean>(true)

  // Fetch user and superadmins on component mount
  useEffect(() =>
  {
    fetchUserAndAdmins()
  }, [])

  async function fetchUserAndAdmins()
  {
    setLoading(true)
    try {
      // Fetch the current user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Error fetching user:', userError)
        setUser(null)
      } else {
        setUser(userData.user)
      }

      // Fetch the list of superadmins
      const { data: adminsData, error: adminsError } = await supabase.from('superadmins').select('*')
      if (adminsError) {
        console.error('Error fetching superadmins:', adminsError)
        setSuperadmins([])
      } else {
        setSuperadmins(adminsData || [])
      }
    } catch (err) {
      console.error('Error in fetchUserAndAdmins:', err)
    } finally {
      setLoading(false)
    }
  }

  // Compute isAuthorized when user or superadmins change
  const isAuthorized = React.useMemo(() =>
  {
    if (!user || superadmins.length === 0) return false
    return superadmins.some((admin) => admin.email === user.email)
  }, [ user, superadmins ])

  // Redirect if not authorized
  useEffect(() =>
  {
    if (loading) return
    if (!isAuthorized) {
      router.replace('/')
    }
  }, [ loading, isAuthorized, router ])

  // Show a loading indicator or the children
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return <div className="p-8">{children}</div>
}