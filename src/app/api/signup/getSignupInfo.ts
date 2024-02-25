import { groq } from 'next-sanity'
import client from '../../../../sanity/lib/client'

export async function getSignupData() {
  const data = (await client.fetch({
    query: groq`*[_type == "signupPage"] `,
    config: {
      next: { revalidate: 1 },
    },
  })) as SignupPage[]

  return data[0] as SignupPage
}

export type SignupPage = {
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
