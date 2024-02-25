import { groq } from 'next-sanity'
import client from '../../../../sanity/lib/client'
import { PortableTextProps } from '@portabletext/react'

export async function getRulesData() {
  const data = (await client.fetch({
    query: groq`*[_type == "rulesPage"] `,
    config: {
      next: { revalidate: 3600 },
    },
  })) as RulesPage[]

  return data[0] as RulesPage
}

export type RulesPage = {
  headline: string
  mainImage: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  _createdAt: string
  _rev: string
  _type: 'frontPage'
  content: PortableTextProps['value']

  _id: string
  _updatedAt: string
}
