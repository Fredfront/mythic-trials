import React from 'react'
import { getRulesData } from '../api/rules/getRulesData'
import { PortableText } from '@portabletext/react'

const CustomPortableText = ({ content }: { content: any }) => {
  return (
    <div>
      {content.map(
        (
          block: {
            _type: string
            style: string
            children: {
              text:
                | string
                | number
                | boolean
                | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | React.PromiseLikeOfReactNode
                | Iterable<React.ReactNode>
                | null
                | undefined
            }[]
          },
          index: React.Key | null | undefined,
        ) => {
          {
            return (
              <div className=" pr-4 pl-4 mb-4" key={index}>
                {block.children[0].text}
              </div>
            )
          }
        },
      )}
    </div>
  )
}

async function page() {
  const rulesData = await getRulesData()

  console.log(rulesData.content)

  return (
    <div className="w-full min-h-56 flex flex-col justify-between pt-10">
      <div className="flex justify-center">
        <h1 className="text-2xl lg:text-4xl font-extrabol text-white">{rulesData.headline}</h1>
      </div>
      <div className="flex flex-col max-w-7xl m-auto mt-10 justify-center pb-4 text-white">
        <CustomPortableText content={rulesData?.content} />
      </div>
    </div>
  )
}

export default page
