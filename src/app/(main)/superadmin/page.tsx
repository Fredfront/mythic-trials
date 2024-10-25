import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gamepad2, MessageCircle } from 'lucide-react'

const page = async () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white mt-2">Welcome to your dashboard. What would you like to do today?</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gamepad2 className="mr-2" />
              Create Matches
            </CardTitle>
            <CardDescription className="text-white">Set up new matches for your players</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-white text-black">
              <Link href="/superadmin/create-matches">Create Matches (Round-robin)</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2" />
              Create Discord Channels
            </CardTitle>
            <CardDescription className="text-white">Set up new Discord channels for communication</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-white text-black">
              <Link href="/superadmin/create-discord-channels">Create Discord Channels</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gamepad2 className="mr-2" />
              Discord users
            </CardTitle>
            <CardDescription className="text-white">Manage users in Discord server</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-white text-black">
              <Link href="/superadmin/discord-users">See Discord users overview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default page
