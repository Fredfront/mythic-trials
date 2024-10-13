import React from 'react'
import { getRulesData } from '../../api/rules/getRulesData'
import { PortableText } from '@portabletext/react'
import { Hourglass, Smile, Trophy, User } from 'lucide-react'

async function page() {
  const rulesData = await getRulesData()
  return (
    <>
      <div className="flex max-w-5xl justify-center m-auto">
        <RuleIconBox />
      </div>
      <div className="p-2">
        <div className=" max-w-4xl m-auto min-h-56 flex flex-col justify-between pt-10">
          <div className="flex ">
            <h1 className=" p-1 text-3xl md:text-4xl font-extrabold text-white">{rulesData.headline}</h1>
          </div>
          <div className="flex flex-col max-w-7xl m-auto  justify-center  text-white portableText">
            <PortableText value={rulesData?.content} />
          </div>
        </div>
      </div>
    </>
  )
}

export default page

const RuleIconBox = () => {
  return (
    <div className="flex gap-4 mt-12 flex-wrap pl-4 pr-4 lg:pl-0 ">
      <div className="bg-[#021F33] md:w-52 w-full md:h-20 p-2 lg:text-left text-center rounded-md items-center flex flex-col md:flex-row justify-center">
        <div className="md:pr-4 mb-2 md:mb-0">
          <User size="32" fill="white" />
        </div>
        <div className="text-lg md:text-xl  font-bold md:border-l-2 border-t-2 md:border-t-0 pt-2 md:pt-0">
          <div className="md:pl-4 pl-0">5-8 </div>
          <div className="md:pl-4 pl-0 -mt-1">Spillere</div>
        </div>
      </div>
      <div className="bg-[#021F33] md:w-52 w-full md:h-20 p-2 lg:text-left text-center rounded-md items-center flex flex-col md:flex-row justify-center">
        <div className="md:pr-4 mb-2 md:mb-0">
          <Hourglass size="32" color="white" />
        </div>
        <div className="text-lg md:text-xl  font-bold md:border-l-2 border-t-2 md:border-t-0 pt-2 md:pt-0">
          <div className="md:pl-4 pl-0">4</div>
          <div className="md:pl-4 pl-0 -mt-1">Uker</div>
        </div>
      </div>
      <div className="bg-[#021F33] md:w-52 w-full md:h-20 p-2 lg:text-left text-center rounded-md items-center flex flex-col md:flex-row justify-center">
        <div className="md:pr-4 mb-2 md:mb-0">
          <Trophy size="32" fill="white" />
        </div>
        <div className="text-lg md:text-xl  font-bold md:border-l-2 border-t-2 md:border-t-0 pt-2 md:pt-0">
          <div className="md:pl-4 pl-0">Gode </div>
          <div className="md:pl-4 pl-0 -mt-1">Premier</div>
        </div>
      </div>
      <div className="bg-[#021F33] md:w-52 w-full md:h-20 p-2 lg:text-left text-center rounded-md items-center flex flex-col md:flex-row justify-center">
        <div className="md:pr-4 mb-2 md:mb-0">
          <Smile size="32" fill="white" color="black" />
        </div>
        <div className="text-lg md:text-xl  font-bold md:border-l-2 border-t-2 md:border-t-0 pt-2 md:pt-0">
          <div className="md:pl-4 pl-0">God</div>
          <div className="md:pl-4 pl-0 -mt-1">Stemning</div>
        </div>
      </div>
    </div>
  )
}
