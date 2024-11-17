'use client'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gamepad, MessageCircle, Users } from 'lucide-react'
import { DiscordLogoIcon } from '@radix-ui/react-icons'
import { SupabaseTeamType } from '../../../../types'
import { useEffect, useState } from 'react'
import { useGetUserData } from '@/app/auth/useGetUserData'
import supabase from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { AnimatedTooltip } from '@/app/components/AnimatedTooltip'
import { Icons } from '@/components/ui/icons'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { InfoBoxComponent } from '@/components/info-box'

const MyPage = ({ sanityTeams }: { sanityTeams: MythicPlusTeam[] }) => {
  const discordLinkFromLocalStorage =
    typeof window !== 'undefined'
      ? (JSON.parse(localStorage.getItem('discord_invite_link') || 'null') as {
          invite_link: string
          timestamp: number
        } | null)
      : null

  const { user, loading } = useGetUserData()
  const [discordLink, setDiscordLink] = useState<string | undefined>(
    discordLinkFromLocalStorage?.invite_link || undefined,
  )
  const sanityTeam = sanityTeams?.find((e) => e.contactPerson === user?.data.user?.email)
  const [loadingCreateInvite, setLoadingCreateInvite] = useState(false)

  const mappedTeam = sanityTeam?.players.map((player) => ({
    id: player.characterName,
    characterName: player.characterName,
    realmName: player.realmName,
  }))

  //Clear the discord link from local storage after 7 days
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const discordLinkFromLocalStorage = JSON.parse(localStorage.getItem('discord_invite_link') || 'null') as {
        invite_link: string
        timestamp: number
      } | null
      setDiscordLink(discordLinkFromLocalStorage?.invite_link || undefined)

      // Clear the discord link from local storage after 7 days
      if (discordLinkFromLocalStorage && new Date().getTime() - discordLinkFromLocalStorage.timestamp > 604800000) {
        localStorage.removeItem('discord_invite_link')
      }
    }
  }, [])

  const [team, setTeam] = useState<SupabaseTeamType | undefined>(undefined)

  const name = user?.data.user?.identities?.[0].identity_data?.full_name || user?.data.user?.email

  useEffect(() => {
    if (!user || loading) return
    async function fetchTeam() {
      await supabase
        .from('teams')
        .select('*')
        .eq('contact_person', user?.data.user?.email)
        .then(({ data, error }) => {
          if (error) {
            console.error(error)
            return
          }
          if (data) {
            setTeam(data[0])
          }
        })
    }
    fetchTeam()
  }, [user, loading])

  const createDiscordInvite = async () => {
    setLoadingCreateInvite(true)
    try {
      const response = await fetch('/api/discord/create-invite-link')
      const data = await response.json()
      if (data.invite_link) {
        setDiscordLink(data.invite_link)
        localStorage.setItem(
          'discord_invite_link',
          JSON.stringify({
            invite_link: data.invite_link,
            timestamp: new Date().getTime(),
          }),
        )
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingCreateInvite(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(discordLink!)
    toast({
      title: 'Kopiert til utklippstavlen',
      description: 'Lenken er kopiert til utklippstavlen',
    })
  }

  const router = useRouter()

  useEffect(() => {
    if (!user || loading) return
    if (user.data.user?.email && !sanityTeam) {
      router.push('/')
    }
  }, [user, loading, sanityTeam, router])

  if (!user?.data.user?.email || (user.data.user?.email && !sanityTeam) || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <InfoBoxComponent
            title="Du har ikke laget noe lag enda"
            description="Du må ha et lag for å kunne bruke denne siden. Opprett et lag for å fortsette."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-xl">
            Velkommen til ditt dashboard, <span className="font-semibold capitalize">{name}</span>
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <DiscordLogoIcon className="mr-2 h-6 w-6" />
                Discord Invite
              </CardTitle>
              <CardDescription className="text-gray-400">
                Opprett Discord invitasjonslenke for laget ditt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                disabled={discordLink !== undefined || loadingCreateInvite}
                onClick={createDiscordInvite}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                {discordLink ? 'Du har allerede opprettet lenke' : 'Opprett lenke'}
                {loadingCreateInvite && <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </CardContent>
            {discordLink && (
              <CardFooter className="flex flex-col items-start">
                <div className="flex w-full">
                  <Input readOnly value={discordLink} className="bg-gray-700 text-white cursor-copy rounded-r-none" />
                  <Button onClick={copyToClipboard} className="bg-indigo-600 hover:bg-indigo-700 rounded-l-none">
                    Kopier
                  </Button>
                </div>
                <CardDescription className="text-gray-400 mt-2">
                  Lenken er gyldig i 7 dager og kan brukes 7 ganger.
                </CardDescription>
              </CardFooter>
            )}
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Users className="mr-2 h-6 w-6" />
                Endre på laget mitt
              </CardTitle>
              <CardDescription className="text-gray-400">Du kan endre på spillere på laget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <AnimatedTooltip items={mappedTeam as any} />
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/signup/editTeam/${team?.team_slug}`} className="w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                  Legg til eller fjern spillere
                </Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Gamepad className="mr-2 h-6 w-6" />
                Mine kamper
              </CardTitle>
              <CardDescription className="text-gray-400">
                Oversikt over mine kommende kamper. Her vil du også finne Pick/Ban, Legg inn resultat, og foreslå ny
                kampdato.
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter>
              <Link href={'/my-matches'} className="w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                  Mine kamper
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MyPage
