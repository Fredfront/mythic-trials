export async function getToken() {
  const client_id = 'd34a81ec46a047b9a1811057551b5ce5'
  const client_secret = 'DzpHAsctVQQ1MmHPJ3osYOIX8BZa7B59'

  const url = 'https://eu.battle.net/oauth/token'

  const credentials = `${client_id}:${client_secret}`
  const encodedCredentials = Buffer.from(credentials).toString('base64')

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encodedCredentials}`,
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
