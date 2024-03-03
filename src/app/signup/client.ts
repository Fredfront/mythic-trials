import { createClient } from '@sanity/client'
import { projectId, dataset, apiVersion, useCdn, token } from '.././../../sanity/env'

export const mutateClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  token,
})
