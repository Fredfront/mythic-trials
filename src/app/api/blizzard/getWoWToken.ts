export async function getToken() {
  const client_id = process.env.BLIZZARD_CLIENT_ID
  const client_secret = process.env.BLIZZARD_CLIENT_SECRET

  const url = 'https://eu.battle.net/oauth/token'

  const credentials = `${client_id}:${client_secret}`
  const encodedCredentials = Buffer.from(credentials).toString('base64')

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encodedCredentials}`,
      'cache-control': 'max-age=3600',
    },
    body: 'grant_type=client_credentials',
  }

  try {
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      return data.access_token
    } else {
      throw new Error('Failed to retrieve token')
    }
  } catch (error) {
    console.error('Error fetching token:', error)
    return null
  }
}
