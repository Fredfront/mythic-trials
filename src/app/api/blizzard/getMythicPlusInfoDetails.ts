export async function getMythicPlusInfoDetails({
  token,
  realm,
  character,
}: {
  token?: string
  realm?: string
  character?: string
}) {
  if (!token || !realm || !character) {
    throw new Error('Missing parameters')
  }

  const res = await fetch(
    `https://eu.api.blizzard.com/profile/wow/character/${realm}/${character}/mythic-keystone-profile/season/11?namespace=profile-eu&locale=en_US&access_token=${token}`,
  )

  return res?.json()
}
