import { dungeonConfig } from '@/app/(main)/turnering/utils/dungeonConfig'
import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { toast } from '@/hooks/use-toast'
import { PickAndBansType } from '@/supabase/dbFunctions'

export async function setReady({
  sanityTeamData,
  email,
  contact_person,
  round,
  teamReady,
  homeTeam,
  awayTeam,
  opponentReady,
}: {
  sanityTeamData: MythicPlusTeam[]
  email: string
  contact_person: string
  round: number
  teamReady: boolean
  homeTeam: string
  awayTeam: string
  opponentReady: boolean
}) {
  if (!email || !contact_person || !round) return

  fetch('/api/supabase/pick-ban/ready-check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contact_person: contact_person,
      round: round,
      ready: !teamReady,
    }),
  })
    .then((res) => {
      if (res.ok) {
        const channelName = `${homeTeam}-vs-${awayTeam}`
        const roleName = sanityTeamData.find((e) => e.contactPerson === contact_person)?.teamName

        let message = ''

        if (!opponentReady) {
          message = `@here 📢 **${sanityTeamData.find((e) => e.contactPerson === contact_person)?.teamName}** is ${!teamReady ? '✅ **READY** ✅' : '❌ **NO LONGER READY** ❌'} to start pick/ban!`
        }

        if (opponentReady) {
          message = `@here 📢 Both teams are ready to start pick/ban! ${sanityTeamData.find((e) => e.teamSlug === awayTeam)?.teamName} will start the pick/ban process. Good luck! `
        }

        // Send message to Discord channel with role mention
        fetch('/api/discord/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelName, message, roleName }),
        }).then(() => {
          toast({
            title: '',
            description: `Message posted to discord channel: ${channelName}`,
          })
        })
      }
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

export async function setBannedDungeons({
  dungeon,
  round,
  contact_person,
  myTeamData,
  homeTeam,
  awayTeam,
  sanityTeamData,
}: {
  dungeon: number
  round: number
  contact_person: string
  myTeamData: any
  homeTeam: string
  awayTeam: string
  sanityTeamData: MythicPlusTeam[]
}) {
  if (!contact_person || !round) return
  const existingBans = myTeamData?.bans || []
  const newBans = [...existingBans, dungeon]

  fetch('/api/supabase/pick-ban/ban', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contact_person: contact_person,
      round: round,
      bans: newBans,
      step: myTeamData?.step,
    }),
  })
    .then((res) => {
      if (res.ok) {
        const channelName = `${homeTeam}-vs-${awayTeam}`
        const roleName = sanityTeamData.find((e) => e.contactPerson === contact_person)?.teamName
        const message = `@here 🔒 **${sanityTeamData.find((e) => e.contactPerson === contact_person)?.teamName}** banned **${dungeonConfig.find((d) => d.id === dungeon)?.name}**`
        // Send message to Discord channel with role mention
        fetch('/api/discord/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelName, message, roleName }),
        }).then(() => {
          toast({
            title: '',
            description: `Message posted to discord channel: ${channelName}`,
          })
        })
      }
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

export async function setPickedDungeon({
  dungeon,
  round,
  contact_person,
  homeTeam,
  awayTeam,
  sanityTeamData,
  myTeamData,
  isBestOfTwo,
}: {
  dungeon: number
  round: number
  contact_person: string
  homeTeam: string
  awayTeam: string
  sanityTeamData: MythicPlusTeam[]
  myTeamData: PickAndBansType | undefined
  isBestOfTwo: boolean
}) {
  if (!contact_person || !round) return

  fetch('/api/supabase/pick-ban/pick', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contact_person: contact_person,
      round: round,
      pick: dungeon,
      step: myTeamData?.step,
      myTeamData: myTeamData,
      isBo2: isBestOfTwo,
      homeTeam: homeTeam,
    }),
  })
    .then((res) => {
      if (res.ok) {
        const channelName = `${homeTeam}-vs-${awayTeam}`
        const roleName = sanityTeamData.find((e) => e.contactPerson === contact_person)?.teamName

        let message = `@here 🎯 **${sanityTeamData.find((e) => e.contactPerson === contact_person)?.teamName}** picked **${dungeonConfig.find((d) => d.id === dungeon)?.name}**`

        if (myTeamData?.step === 4 && isBestOfTwo && myTeamData.home) {
          message = `@here 🎯 **${sanityTeamData.find((e) => e.contactPerson === contact_person)?.teamName}** picked **${dungeonConfig.find((d) => d.id === dungeon)?.name}**

**Pick ban phase is now over! Good luck in your matches!** 
          `
        }

        // Send message to Discord channel with role mention
        fetch('/api/discord/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelName, message, roleName }),
        }).then(() => {
          toast({
            title: '',
            description: `Message posted to discord channel: ${channelName}`,
          })
        })
      }
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}
