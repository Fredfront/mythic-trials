import { groq } from 'next-sanity'
import client from '../../../../sanity/lib/client'

export async function GETSignupData() {
  const res = (await client.fetch({
    query: groq`*[_type == "signupPage"] `,
  })) as SignupPage[]
  const data = await res

  return Response.json({ data })
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
