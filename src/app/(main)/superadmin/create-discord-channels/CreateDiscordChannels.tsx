'use client'

import { ArrowLeft, Trash2, Plus, Archive } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CreateDiscordChannels()
{
  const [ round, setRound ] = useState('')
  const [ message, setMessage ] = useState('')
  const [ isLoading, setIsLoading ] = useState(false)
  const [ status, setStatus ] = useState<'idle' | 'success' | 'error'>('idle')
  const [ channels, setChannels ] = useState<any[]>([])
  const [ channelsLoading, setChannelsLoading ] = useState(false)
  const [ channelsError, setChannelsError ] = useState('')

  useEffect(() =>
  {
    fetchChannels()
  }, [])

  const fetchChannels = async () =>
  {
    setChannelsLoading(true)
    setChannelsError('')
    try {
      const response = await fetch('/api/discord/get-channels')
      const result = await response.json()
      if (response.ok) {
        const channels = result.channels
        const channelMap = new Map<string, any>()
        channels.forEach((channel: any) =>
        {
          channel.children = []
          channelMap.set(channel.id, channel)
        })

        const rootChannels: any[] = []
        channels.forEach((channel: any) =>
        {
          if (channel.parent_id) {
            const parent = channelMap.get(channel.parent_id)
            if (parent) {
              parent.children.push(channel)
            } else {
              rootChannels.push(channel)
            }
          } else {
            rootChannels.push(channel)
          }
        })

        const sortChannels = (channels: any[]) =>
        {
          channels.sort((a, b) => a.name.localeCompare(b.name))
          channels.forEach((channel) =>
          {
            if (channel.children && channel.children.length > 0) {
              sortChannels(channel.children)
            }
          })
        }
        sortChannels(rootChannels)

        setChannels(rootChannels)
      } else {
        setChannelsError(`Error: ${result.error}`)
      }
    } catch (error) {
      setChannelsError(`Fetch error: ${(error as Error).message}`)
    } finally {
      setChannelsLoading(false)
    }
  }

  const handleCreateChannels = async () =>
  {
    setIsLoading(true)
    setMessage('Creating channels...')
    setStatus('idle')

    try {
      const response = await fetch('/api/discord/create-discord-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round: Number(round) }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`Channels created successfully for round ${round}.`)
        setStatus('success')
        console.log('Result:', result)
        fetchChannels()
      } else {
        setMessage(`Error: ${result.error}`)
        setStatus('error')
      }
    } catch (error) {
      setMessage(`Fetch error: ${(error as Error).message}`)
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChannels = async () =>
  {
    setIsLoading(true)
    setMessage('Deleting channels...')
    setStatus('idle')

    try {
      const response = await fetch('/api/discord/delete-discord-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round: Number(round) }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`Channels deleted successfully for round ${round}.`)
        setStatus('success')
        console.log('Result:', result)
        fetchChannels()
      } else {
        setMessage(`Error: ${result.error}`)
        setStatus('error')
      }
    } catch (error) {
      setMessage(`Fetch error: ${(error as Error).message}`)
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChannel = async (channelId: string) =>
  {
    if (!confirm('Are you sure you want to delete this channel?')) return

    try {
      const response = await fetch('/api/discord/delete-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`Channel deleted successfully.`)
        setStatus('success')
        fetchChannels()
      } else {
        setMessage(`Error: ${result.error}`)
        setStatus('error')
      }
    } catch (error) {
      setMessage(`Fetch error: ${(error as Error).message}`)
      setStatus('error')
    }
  }

  const handleArchiveChannel = async (channelId: string) =>
  {
    if (!confirm('Are you sure you want to archive this channel?')) return

    try {
      const response = await fetch('/api/discord/archive-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`Channel archived successfully.`)
        setStatus('success')
        fetchChannels()
      } else {
        setMessage(`Error: ${result.error}`)
        setStatus('error')
      }
    } catch (error) {
      setMessage(`Fetch error: ${(error as Error).message}`)
      setStatus('error')
    }
  }

  const renderChannels = (channels: any[], level = 0) =>
  {
    return channels.map((channel) => (
      <div key={channel.id} className={`pl-${level * 4} py-2`}>
        <div className="flex items-center justify-between bg-gray-700 p-2 rounded">
          <div>
            <div className="text-lg font-semibold">
              {channel.type === 4 ? '📁' : '💬'} {channel.name}
            </div>
            <div className="text-sm text-gray-300">ID: {channel.id}</div>
            {channel.parent_id && (
              <div className="text-sm text-gray-300">Parent ID: {channel.parent_id}</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => handleArchiveChannel(channel.id)}
            >
              <Archive className="mr-2 h-4 w-4" /> Archive
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleDeleteChannel(channel.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
        {channel.children && channel.children.length > 0 && renderChannels(channel.children, level + 1)}
      </div>
    ))
  }

  const roundChannels = channels.filter(channel => channel.name.toLowerCase().startsWith('round'))
  const otherChannels = channels.filter(channel => !channel.name.toLowerCase().startsWith('round'))
  const archivedChannels = channels.filter(channel => channel.name.toLowerCase() === 'archived')

  return (
    <div className="min-h-screen bg-[#011624] p-4 text-gray-100">
      <Link
        href="/superadmin"
        className="inline-flex items-center mb-6 text-sm font-medium text-gray-300 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Super Admin
      </Link>

      <Card className="max-w-2xl mx-auto bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Manage Discord Channels for Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Input
                type="number"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                placeholder="Enter round number"
                className="flex-grow bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateChannels}
                  disabled={isLoading || !round}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create
                </Button>
                <Button
                  onClick={handleDeleteChannels}
                  disabled={isLoading || !round}
                  variant="destructive"
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            {message && (
              <Alert
                variant={status === 'error' ? 'destructive' : 'default'}
                className={`${status === 'error' ? 'bg-red-900 border-red-800' : 'bg-green-900 border-green-800'
                  } text-white`}
              >
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-4xl mx-auto bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Discord Channels</CardTitle>
        </CardHeader>
        <CardContent>
          {channelsLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : channelsError ? (
            <Alert variant="destructive" className="bg-red-900 border-red-800 text-white">
              <AlertDescription>{channelsError}</AlertDescription>
            </Alert>
          ) : (
            <Tabs defaultValue="round" className="w-full">
              <TabsList className="grid w-full grid-cols-3 text-black">
                <TabsTrigger value="round">Round Channels</TabsTrigger>
                <TabsTrigger value="other">Other Channels</TabsTrigger>
                <TabsTrigger value="archived">Archived Channels</TabsTrigger>
              </TabsList>
              <TabsContent value="round" className="mt-4">
                <div className="space-y-2">
                  {renderChannels(roundChannels)}
                </div>
              </TabsContent>
              <TabsContent value="other" className="mt-4">
                <div className="space-y-2">
                  {renderChannels(otherChannels)}
                </div>
              </TabsContent>
              <TabsContent value="archived" className="mt-4">
                <div className="space-y-2">
                  {renderChannels(archivedChannels)}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}