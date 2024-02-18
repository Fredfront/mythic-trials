import { getTeamByNameFromSanity } from '@/app/api/getTeamFromSanity'
import { MythicPlusTeam } from '@/app/page'
import { urlForImage } from '../../../../sanity/lib/image'

export default async function Page({ params }: { params: { slug: string } }) {
  const data = await getTeamByNameFromSanity(params.slug)

  return (
    <div>
      <img src={urlForImage(data?.teamImage.asset._ref)} width={'200px'} />
      {data?.teamName}
    </div>
  )
}
