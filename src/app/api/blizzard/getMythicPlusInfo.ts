export async function getMythicPlusInfo({ token, endpoint }: { token: string; endpoint?: string }) {
  if (!endpoint || !token) return null // Return null if endpoint or token is missing
  try {
    const res = await fetch(`${endpoint}&locale=en_US&access_token=${token}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`)
    }
    return await res.json() // Return parsed JSON response
  } catch (error) {
    console.error('Error fetching Mythic Plus info:', error)
    return null // Return null in case of any error
  }
}
