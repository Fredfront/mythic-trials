export async function getWowCharacterFromBlizzard({
  token,
  realm,
  character,
}: {
  token: string
  realm: string
  character: string
}) {
  const res = await fetch(
    `https://eu.api.blizzard.com/profile/wow/character/${realm}/${character}?namespace=profile-eu&locale=en_US&access_token=${token}`,
  )

  if (res.status === 404) {
    return null
  }

  return res.json() as Promise<CharacterData>
}

export interface CharacterData {
  _links: {
    self: {
      href: string
    }
  }
  id: number
  name: string
  gender: {
    type: string
    name: string
  }
  faction: {
    type: string
    name: string
  }
  race: {
    key: {
      href: string
    }
    name: string
    id: number
  }
  character_class: {
    key: {
      href: string
    }
    name: string
    id: number
  }
  active_spec: {
    key: {
      href: string
    }
    name: string
    id: number
  }
  realm: {
    key: {
      href: string
    }
    name: string
    id: number
    slug: string
  }
  guild?: {
    key: {
      href: string
    }
    name: string
    id: number
    realm: {
      key: {
        href: string
      }
      name: string
      id: number
      slug: string
    }
    faction: {
      type: string
      name: string
    }
  }
  level: number
  experience: number
  achievement_points: number
  achievements: {
    href: string
  }
  titles: {
    href: string
  }
  pvp_summary: {
    href: string
  }
  encounters: {
    href: string
  }
  media: {
    href: string
  }
  last_login_timestamp: number
  average_item_level: number
  equipped_item_level: number
  specializations: {
    href: string
  }
  statistics: {
    href: string
  }
  mythic_keystone_profile: {
    href: string
  }
  equipment: {
    href: string
  }
  appearance: {
    href: string
  }
  collections: {
    href: string
  }
  reputations: {
    href: string
  }
  quests: {
    href: string
  }
  achievements_statistics: {
    href: string
  }
  professions: {
    href: string
  }
  covenant_progress: {
    chosen_covenant: {
      key: {
        href: string
      }
      name: string
      id: number
    }
    renown_level: number
    soulbinds: {
      href: string
    }
  }
  name_search: string
}
