'use client'

import { MythicPlusTeam } from '@/app/api/getAllTeams'
import { cn } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { urlForImage } from '../../../sanity/lib/image'
import Link from 'next/link'

export const InfiniteMovingCards = ({
  teams,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
}: {
  teams: MythicPlusTeam[]
  direction?: 'left' | 'right'
  speed?: 'fast' | 'normal' | 'slow'
  pauseOnHover?: boolean
  className?: string
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const scrollerRef = React.useRef<HTMLUListElement>(null)

  useEffect(() => {
    addAnimation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [start, setStart] = useState(false)
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children)

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true)
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem)
        }
      })

      getDirection()
      getSpeed()
      setStart(true)
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === 'left') {
        containerRef.current.style.setProperty('--animation-direction', 'forwards')
      } else {
        containerRef.current.style.setProperty('--animation-direction', 'reverse')
      }
    }
  }
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === 'fast') {
        containerRef.current.style.setProperty('--animation-duration', '20s')
      } else if (speed === 'normal') {
        containerRef.current.style.setProperty('--animation-duration', '40s')
      } else {
        containerRef.current.style.setProperty('--animation-duration', '80s')
      }
    }
  }
  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative z-20  w-full overflow-hidden  [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]',
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          ' flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap',
          start && 'animate-scroll ',
          pauseOnHover && 'hover:[animation-play-state:paused]',
        )}
      >
        {teams
          .slice()
          .sort((a, b) => {
            return a.teamSlug.localeCompare(b.teamSlug)
          })
          .map((item) => (
            <Link prefetch={true} href={`/team/${item.teamSlug}`} key={item._id}>
              <div
                key={item._key}
                className="p-4 flex items-center rounded-md bg-[#021F33] text-white  hover:bg-slate-500 cursor-pointer  max-w-80  min-w-72 "
              >
                <Image
                  src={urlForImage(item.teamImage.asset._ref as any)}
                  alt={item.teamName}
                  className="rounded-full mr-4  h-24 w-24 aspect-auto "
                  width={100}
                  height={100}
                />
                <div className="text-xl font-extrabold text-white">{item.teamName}</div>
              </div>
            </Link>
          ))}
      </ul>
    </div>
  )
}
