import { groq } from 'next-sanity'
import client from '../../../../sanity/lib/client'
import { RulesPage } from '../frongpageNews/getFrontpageNewsData'

export async function getRulesData() {
  const data = (await client.fetch({
    query: groq`*[_type == "rulesPage"] `,
    config: {
      next: { revalidate: 1 },
    },
  })) as RulesPage[]

  return data[0] as RulesPage
}
