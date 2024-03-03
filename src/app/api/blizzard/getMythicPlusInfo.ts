export async function getMythicPlusInfo({ token, endpoint }: { token: string; endpoint?: string }) {
  if (!endpoint || !token) return null
  const res = await fetch(`${endpoint}&locale=en_US&access_token=${token}`)

  return res.json()
}
