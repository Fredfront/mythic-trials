import React from 'react'
import { getRulesData } from '../api/rules/getRulesData'
import { PortableText } from '@portabletext/react'

async function page() {
  const rulesData = await getRulesData()
  return (
    <div className=" max-w-4xl m-auto min-h-56 flex flex-col justify-between pt-10">
      <div className="flex justify-center">
        <h1 className=" p-2 text-3xl md:text-4xl font-extrabold text-white">{rulesData.headline}</h1>
      </div>
      <div className="flex flex-col max-w-7xl m-auto lg:mt-10 justify-center  text-white portableText">
        <PortableText value={rulesData?.content} />
      </div>
    </div>
  )
}

export default page
