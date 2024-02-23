import { groq } from 'next-sanity'
import client from '../../../../sanity/lib/client'

export async function getFrontpageData() {
  const data = (await client.fetch({
    query: groq`*[_type == "frontPage"] `,
    config: {
      next: { revalidate: 1 },
    },
  })) as FrontPage[]

  return data[0] as FrontPage
}

type FrontPage = {
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
  smallTextDescription: string
  _id: string
  _updatedAt: string
}
