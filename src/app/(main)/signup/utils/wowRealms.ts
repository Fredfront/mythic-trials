import wowRealms from './wow-realms.json'

export const wowRealmsMapped = wowRealms.Realms.map((realm) => {
  return { name: realm.name, label: realm.name }
})
