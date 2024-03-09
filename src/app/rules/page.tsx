import React from 'react'
import { getRulesData } from '../api/rules/getRulesData'
import { PortableText } from '@portabletext/react'

async function page() {
  const rulesData = await getRulesData()

  return (
    <div className="w-full min-h-56 flex flex-col justify-between pt-10">
      <div className="flex justify-center">
        <h1 className="text-2xl lg:text-4xl font-extrabol text-white">{rulesData.headline}</h1>
      </div>
      <div className="flex justify-center pb-4 text-white">
        <PortableText value={rulesData?.content} />
      </div>
    </div>
  )
}

export default page
