import React from 'react'
import supabase from '@/utils/supabase/client'
import { UserResponse } from '@supabase/supabase-js'

export function useGetUserData() {
  const [loading, setLoading] = React.useState<boolean>(true)
  const [user, setUser] = React.useState<UserResponse | undefined>(undefined)
  async function fetchUser() {
    await supabase.auth
      .getUser()
      .then((res) => {
        setLoading(false)
        setUser(res)
        sessionStorage.setItem('userEmail', res.data.user?.email || '')
      })
      .catch((err) => {
        setLoading(false)
        console.error(err)
      })
  }

  React.useEffect(() => {
    fetchUser()
  }, [])

  return {
    user,
    loading,
  }
}
