'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MythicPlusTeam, getAllTeams } from '../../api/getAllTeams'
import Loading from './components/Loading'
import { useRouter } from 'next/navigation'

function CreateMythicPlusTeam() {
  const [loading, setLoading] = useState(true)
  const { data, status } = useSession()
  const [allTeams, setAllTeams] = useState<MythicPlusTeam[] | null>(null)
  const router = useRouter()

  const hasCreatedTeam = useMemo(
    () => allTeams?.find((e) => e.contactPerson === data?.user?.email),
    [allTeams, data?.user?.email],
  )

  useEffect(() => {
    async function fetchAllTeams() {
      const data = await getAllTeams()
      setAllTeams(data)
      setLoading(false)
    }
    fetchAllTeams()
  }, [])

  useEffect(() => {
    if (status === 'loading') {
      return
    }
    if (!loading && hasCreatedTeam) {
      router.prefetch(`/signup/existingTeam/${hasCreatedTeam.teamSlug}`)
      router.push(`/signup/existingTeam/${hasCreatedTeam.teamSlug}`)
    }

    if (!loading && !hasCreatedTeam && status === 'authenticated') {
      router.prefetch('/signup/createTeam')
      router.push('/signup/createTeam')
    }

    if (status === 'unauthenticated') {
      router.prefetch('/signup/signin')
      router.push('/signup/signin')
    }
  }, [hasCreatedTeam, loading, router, status])

  return <Loading />
}

export default CreateMythicPlusTeam
