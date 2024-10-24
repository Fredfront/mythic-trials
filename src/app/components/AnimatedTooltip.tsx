'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { motion, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { debounce } from 'lodash'
import { getRaiderIOCharacerData } from '../api/getCharacerData'
const MotionDiv = motion.div as any

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number
    characterName: string
    realmName: string
  }[]
}) =>
{
  return items?.map((item, idx) => <Component key={idx} item={item} />)
}

const Component = (item: any) =>
{
  const springConfig = { stiffness: 100, damping: 5 }

  const x = useMotionValue(0) // going to set this value on mouse move

  const [ hoveredIndex, setHoveredIndex ] = useState<number | null>(null)
  // rotate the tooltip
  const rotate = useSpring(useTransform(x, [ -100, 100 ], [ -45, 45 ]), springConfig)
  // translate the tooltip
  const translateX = useSpring(useTransform(x, [ -100, 100 ], [ -50, 50 ]), springConfig)
  const handleMouseMove = (event: any) =>
  {
    const halfWidth = event.target.offsetWidth / 2
    x.set(event.nativeEvent.offsetX - halfWidth) // set the x value, which is then used in transform and rotate
  }

  const [ playerInfo, setPlayerInfo ] = useState<any>(null)

  // Define a debounced function for fetching player info
  const debouncedGetPlayerInfo = debounce(async () =>
  {
    const info = await getRaiderIOCharacerData({
      characterName: item?.item?.characterName,
      realmName: item?.item?.realmName,
    })
    setPlayerInfo(info)
  }, 1)

  useEffect(() =>
  {
    // Call the debounced function when player changes
    debouncedGetPlayerInfo()

    // Cleanup function to cancel any pending debounced calls when component unmounts
    return () =>
    {
      debouncedGetPlayerInfo.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ item ])

  return (
    <div
      className="-mr-4  relative group"
      key={item.name}
      onMouseEnter={() => setHoveredIndex(item?.item?.id)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <AnimatePresence mode="wait">
        {hoveredIndex === item?.item?.id && (
          <MotionDiv
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 260,
                damping: 10,
              },
            }}
            exit={{ opacity: 0, y: 20, scale: 0.6 }}
            style={{
              translateX: translateX,
              rotate: rotate,
              whiteSpace: 'nowrap',
            }}
            className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-xs  flex-col items-center justify-center rounded-md bg-black z-50 shadow-xl px-4 py-2"
          >
            <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px " />
            <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px " />
            <div className="font-bold text-white relative z-30 text-base">{item?.item?.characterName}</div>
            <div className="text-white text-xs">{item?.item?.realmName}</div>
          </MotionDiv>
        )}
      </AnimatePresence>
      {playerInfo?.thumbnail_url && (
        <Image
          onMouseMove={handleMouseMove}
          height={100}
          width={100}
          src={playerInfo?.thumbnail_url ?? ''}
          alt={playerInfo?.thumbnail_url}
          className="object-cover !m-0 !p-0 object-top rounded-full h-14 w-14 border-2 group-hover:scale-105 group-hover:z-30 border-white  relative transition duration-500"
        />
      )}
    </div>
  )
}
