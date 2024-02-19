export async function getRaiderIOCharacerData({
  characterName,
  realmName,
}: {
  characterName: string
  realmName: string
}) {
  const res = await fetch(
    `https://raider.io/api/v1/characters/profile?region=eu&realm=${realmName}&name=${characterName}`,
  )
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  return res.json() as Promise<WoWCharacter>
}

export type WoWCharacter = {
  name: string
  race: string
  class: string
  active_spec_name: string
  active_spec_role: string
  gender: string
  faction: string
  achievement_points: number
  honorable_kills: number
  thumbnail_url: string
  region: string
  realm: string
  last_crawled_at: string
  profile_url: string
  profile_banner: string
}
