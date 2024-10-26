import React from 'react'
import supabase from '@/utils/supabase/client'
import { UserResponse } from '@supabase/supabase-js'

export function useGetUserData()
{
  const [ loading, setLoading ] = React.useState<boolean>(false)

  const [ user, setUser ] = React.useState<UserResponse | undefined>(undefined)
  async function fetchUser()
  {
    setLoading(true)
    await supabase.auth
      .getUser()
      .then((res) =>
      {
        setUser(res)
        if (res.data.user?.email) {
          setLoading(false)

        }


      })
      .catch((err) =>
      {
        setLoading(false)
        console.error(err)
      })
  }

  React.useEffect(() =>
  {

    if (!user)
      fetchUser()
  }, [ user ])

  return {
    user,
    loading,
  }
}
