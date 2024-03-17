import createImageUrlBuilder from '@sanity/image-url'

import { dataset, projectId } from '../env'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: string) => {
  if (!source) return ''
  return imageBuilder?.image(source).auto('format').fit('max')?.url()
}
