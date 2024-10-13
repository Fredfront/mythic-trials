'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { MythicPlusTeam, getAllTeams } from '../../api/getAllTeams'
import Loading from './components/Loading'
import { useRouter } from 'next/navigation'
import { useGetUserData } from '../../auth/useGetUserData'

function CreateMythicPlusTeam() {
  const [loadingAllTeams, setLoading] = useState(true)
  const [allTeams, setAllTeams] = useState<MythicPlusTeam[] | null>(null)
  const router = useRouter()
  const { user, loading: loadingUser } = useGetUserData()

  const loading = loadingAllTeams || loadingUser

  const hasCreatedTeam = useMemo(
    () => allTeams?.find((e) => e.contactPerson === user?.data.user?.email),
    [allTeams, user?.data.user?.email],
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
    if (!loading && hasCreatedTeam) {
      router.prefetch(`/signup/existingTeam/${hasCreatedTeam.teamSlug}`)
      router.push(`/signup/existingTeam/${hasCreatedTeam.teamSlug}`)
    }

    if (!loading && !hasCreatedTeam && user?.data.user?.email) {
      router.prefetch('/signup/createTeam')
      router.push('/signup/createTeam')
    }

    if (!loading && user?.data.user?.email === undefined) {
      router.prefetch('/signup/signin')
      router.push('/signup/signin')
    }
  }, [hasCreatedTeam, loading, router, user?.data.user?.email])

  return <Loading />
}

export default CreateMythicPlusTeam
