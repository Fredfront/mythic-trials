import SanityClient from 'next-sanity-client'

import { apiVersion, dataset, projectId, useCdn } from '../env'

const client = new SanityClient({
  projectId,
  dataset,
  useCdn,
  apiVersion,
})

export default client
