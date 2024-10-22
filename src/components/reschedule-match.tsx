'use client'

import { useEffect, useState } from 'react'
import { format, Locale } from 'date-fns'
import { Calendar as CalendarIcon, CheckCircle, Clock, Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useForm } from 'react-hook-form'
import { toast } from '@/hooks/use-toast'
import { MatchRecord, SupabaseTeamType } from '../../types'
import { useSearchParams } from 'next/navigation'
import { InfoBoxComponent } from './info-box'
import { useGetUserData } from '@/app/auth/useGetUserData'
import supabase from '@/utils/supabase/client'
import { nb } from 'date-fns/locale'

// Simulated function to update the database
const updateDatabase = async (data: MatchRescheduleData, id: string, isHomeTeam: boolean) =>
{


  const payload = isHomeTeam ? {
    home_team_proposed_rescheduled_round_date: format(new Date(data.rescheduled_round_date), 'yyyy-MM-dd'),
    home_team_proposed_rescheduled_round_startTime: data.rescheduled_round_startTime,
    home_team_agree_reschedule: true,
  } : {
    away_team_proposed_rescheduled_round_date: format(new Date(data.rescheduled_round_date), 'yyyy-MM-dd'),
    away_team_proposed_rescheduled_round_startTime: data.rescheduled_round_startTime,
    away_team_agree_reschedule: true,
  }

  // Simulate a successful update
  await supabase.from('matches').update(payload).eq('id', id)
}

interface MatchRescheduleData
{
  rescheduled_round_date: Date | string
  rescheduled_round_startTime: string
  proposed_rescheduled_round_date: string | null
  proposed_rescheduled_round_startTime: string | null
  home_team_agree: boolean
  away_team_agree: boolean
  rescheduled: boolean
}

export default function RescheduleMatch({ matchesFromServer, teams, rounds }: { matchesFromServer: MatchRecord[]; teams: SupabaseTeamType[], rounds: { round: number, round_date: string }[] })
{
  const [ matches, setMatches ] = useState(matchesFromServer)
  const { loading, user } = useGetUserData()
  const email = user?.data.user?.email
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const match = matches.find((match) => match.id === id)
  const homeTeam = teams.find((team) => team.id === match?.home_team_id)
  const awayTeam = teams.find((team) => team.id === match?.away_team_id)
  const isHomeTeam = homeTeam?.contact_person === email
  const [ isSubmitting, setIsSubmitting ] = useState(false)
  const form = useForm<MatchRescheduleData>({
    defaultValues: {
      rescheduled_round_date: new Date(match?.rescheduled_round_date || match?.round_date || ''),
      rescheduled_round_startTime: match?.rescheduled_round_startTime || match?.round_startTime || '',
    },
  })



  const roundDate = rounds.find((e) => e.round === match?.round)?.round_date

  const onSubmit = async (data: MatchRescheduleData) =>
  {
    if (!id) return
    setIsSubmitting(true)
    try {
      const result = await updateDatabase(data, id, isHomeTeam)

    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error rescheduling the match. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasProposedReschedule = isHomeTeam ? match?.home_team_agree_reschedule : match?.away_team_agree_reschedule
  const myProposedNewDate = isHomeTeam ? match?.home_team_proposed_rescheduled_round_date : match?.away_team_proposed_rescheduled_round_date
  const myProposedNewTime = isHomeTeam ? match?.home_team_proposed_rescheduled_round_startTime : match?.away_team_proposed_rescheduled_round_startTime


  useEffect(() =>
  {
    const channel = supabase
      .channel('pick_ban')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
        },
        (payload) =>
        {
          const updatedData = payload.new as MatchRecord

          if (updatedData) {
            supabase.from('matches').select('*').then((res) =>
            {
              setMatches(res.data as MatchRecord[])
            }
            )
          }
        },
      )
      .subscribe()

    return () =>
    {
      supabase.removeChannel(channel)
    }
  }, [])


  if (loading) return <div>Loading.. </div>

  return (

    <div className="max-w-lg mx-auto">
      {hasProposedReschedule ? (
        <div className="mt-8 p-6 bg-blue-600  rounded-lg shadow-md">
          <div className="flex items-center justify-center mb-4">
            <Hourglass className="w-12 h-12  mr-2" />
            <h2 className="text-2xl font-bold">Venter på moststander</h2>
          </div>
          <p className="text-center mb-4">
            Du har foreslått en ny dato for kampen. Motstanderlaget må godkjenne forslaget før endringen blir gjeldende.
          </p>
          <div className="bg-blue-600 p-4 rounded-md">
            {myProposedNewDate && <p><strong>Foreslått dato:</strong> {format(new Date(myProposedNewDate || ''), 'PPP', {
              locale: nb,
            })}</p>}
            <p><strong>Foreslått tid:</strong> {myProposedNewTime}</p>
          </div>
          <Button onClick={async () =>
          {

            //remove proposed reschedule
            const payload = isHomeTeam ? {
              home_team_proposed_rescheduled_round_date: null,
              home_team_proposed_rescheduled_round_startTime: null,
              home_team_agree_reschedule: false,
            } : {
              away_team_proposed_rescheduled_round_date: null,
              away_team_proposed_rescheduled_round_startTime: null,
              away_team_agree_reschedule: false,
            }

            await supabase.from('matches').update(payload).eq('id', id)

          }} className='bg-red-600'>Avbryt forespørsel</Button>
        </div>

      ) : (
        <>
          <InfoBoxComponent
            title="Viktig info"
            description='Om du sender inn en forespørsel om å endre kampdato, må motstanderlaget godkjenne forespørselen før endringen blir gjeldende.'
          />
          <div className="mt-8 p-6 bg-[#07527d47] text-white rounded-lg shadow-md mb-10">
            <h1 className="text-2xl font-bold mb-2">Forespørsel om å flytte kamp</h1>
            <h2 className="text-xl mb-4">{homeTeam?.name} vs {awayTeam?.name} (runde {match?.round})</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name='rescheduled_round_date'
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ny dato</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal bg-[#011624] border-white',
                                !field.value && 'text-gray-400',
                              )}
                            >
                              {field.value ? format(field.value, 'PPP', {
                                locale: nb,
                              }) : <span>Velg ny dato (Må være innenfor rundeuke)</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            fromDate={new Date(roundDate || '')}
                            //to date should be new date() + 6 days
                            toDate={new Date(new Date(roundDate || '').setDate(new Date(roundDate || '').getDate() + 6))}
                            locale={nb}
                            mode="single"
                            selected={field.value as Date}
                            onSelect={field.onChange}

                            disabled={(date) =>
                              loading || date < new Date() || date > new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className='text-white'>Velg ny dato for kamp (Må være før neste runde starter)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='rescheduled_round_startTime'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ny starttid</FormLabel>
                      <FormControl>
                        <input
                          disabled={loading}
                          type="time"
                          className="flex h-10  rounded-md border border-input bg-[#011624] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-white text-[#011624] hover:bg-gray-200 transition-colors"
                  disabled={loading || isSubmitting}
                >
                  {isSubmitting ? 'Rescheduling...' : 'Foreslå ny kampdato'}
                </Button>
              </form>
            </Form>
          </div>
        </>
      )}
    </div>
  )
}
