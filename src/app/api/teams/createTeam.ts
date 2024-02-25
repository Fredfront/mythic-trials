// pages/api/createMythicPlusTeam.js

import client from '../../../../sanity/lib/client'

// Next.js API route handler
export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      // Extract necessary data from the request body
      const { teamName, teamImage, players } = req.body

      // Execute the mutation to create the Mythic Plus team
      const result = (await client.createApiUtil('MythicPlusTeam')({
        data: {
          teamName,
          teamImage,
          players,
        },
      })) as any

      // Respond with success message and the created team data
      res.status(200).json({ message: 'Mythic Plus team created successfully', team: result.results[0] })
    } catch (error: any) {
      // Respond with error message if something goes wrong
      res.status(500).json({ error: 'Failed to create Mythic Plus team', details: error.message })
    }
  } else {
    // Respond with method not allowed if request method is not POST
    res.status(405).json({ error: 'Method not allowed' })
  }
}
