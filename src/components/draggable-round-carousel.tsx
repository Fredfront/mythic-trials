'use client'

import React, { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDrag } from '@use-gesture/react'
import { RoundType } from '@/app/(main)/page'

interface Round
{
  day: string
  month: string
  round: string
  date: number
}


export function DraggableRoundCarousel({ roundsFromDB }: { roundsFromDB: RoundType[] })
{
  const scrollRef = useRef<HTMLDivElement>(null)
  const [ showLeftArrow, setShowLeftArrow ] = useState(false)
  const [ showRightArrow, setShowRightArrow ] = useState(true)
  const [ isDragging, setIsDragging ] = useState(false)

  const rounds = mapRounds(roundsFromDB)

  const updateArrows = () =>
  {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1) // -1 to account for rounding errors
    }
  }

  useEffect(() =>
  {
    const currentRef = scrollRef.current
    currentRef?.addEventListener('scroll', updateArrows)
    updateArrows() // Check initial state

    return () => currentRef?.removeEventListener('scroll', updateArrows)
  }, [])

  const bind = useDrag(({ active, movement: [ mx ], direction: [ xDir ], cancel }) =>
  {
    if (scrollRef.current) {
      if (active && Math.abs(mx) > 2) {
        scrollRef.current.scrollLeft -= mx
        setIsDragging(true)
      } else {
        setIsDragging(false)
      }
    }
  }, { filterTaps: true, rubberband: true })

  const scroll = (direction: 'left' | 'right') =>
  {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8 // Scroll 80% of the width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative w-full overflow-hidden">
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 w-16  z-10 pointer-events-none" />
      )}
      <Button
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-300 ease-in-out ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        size="icon"
        variant="secondary"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-300 ease-in-out ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        size="icon"
        variant="secondary"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 w-16 to-transparent z-10 pointer-events-none" />
      )}
      <div
        {...bind()}
        ref={scrollRef}
        className={`flex overflow-x-auto scrollbar-hide gap-4 p-4 w-full cursor-grab active:cursor-grabbing ${isDragging ? 'will-change-transform' : ''
          }`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {rounds.map((round, index) => (
          <div
            key={index}
            className={`flex-shrink-0 flex flex-col items-center bg-[#021F33] rounded-lg p-4 w-[200px] transition-transform ${isDragging ? 'scale-[0.98]' : ''
              } ${round.date > new Date().getTime() ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className="text-center flex border-b border-white pb-2 mb-2 w-full">
              <div className="flex flex-col w-full">
                <span className="font-bold text-2xl">{round.day}</span>
                <span className="text-[#FDB202] font-bold text-2xl">{round.month}</span>
              </div>
            </div>
            <div className="text-lg font-bold">{round.round}</div>
          </div>
        ))}
      </div>
    </div>
  )
}





type DBRound = {
  round: number;
  round_date: string; // format 'YYYY-MM-DD'
};

interface Round
{
  day: string;
  month: string;
  round: string;
  date: number; // timestamp in milliseconds
}

function parseDate(dateStr: string): { year: number; month: number; day: number }
{
  const [ yearStr, monthStr, dayStr ] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // Months are zero-indexed
  const day = parseInt(dayStr, 10);
  return { year, month, day };
}

function mapRounds(dbRounds: DBRound[]): Round[]
{
  const monthNames = [ 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC' ];
  return dbRounds.map(dbRound =>
  {
    const { year, month, day } = parseDate(dbRound.round_date);
    // Create a date object in UTC
    const date = new Date(Date.UTC(year, month, day));
    // Format day and month
    const dayStr = date.getUTCDate().toString().replace(/^0/, ''); // Remove leading zero
    const monthStr = monthNames[ date.getUTCMonth() ];
    // Build the Round object
    return {
      day: dayStr,
      month: monthStr,
      round: `Runde ${dbRound.round}`,
      date: date.getTime(),
    };
  });
}

