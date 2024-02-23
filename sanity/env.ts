export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || new Date().toISOString().slice(0, 10)

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || ''

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

export const useCdn = false
