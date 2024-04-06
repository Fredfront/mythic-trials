import { getToken } from './getWoWToken'

export async function getMythicPlusInfoDetails({
  realm,
  character,
}: {
  token?: string
  realm?: string
  character?: string
}) {
  if (!realm || !character) {
    throw new Error('Missing parameters')
  }
  const token = await getToken()

  const res = await fetch(
    `https://eu.api.blizzard.com/profile/wow/character/${realm}/${character}/mythic-keystone-profile/season/11?namespace=profile-eu&locale=en_US&access_token=${token}`,
    {
      cache: 'no-cache',
    },
  )

  return res?.json()
}
