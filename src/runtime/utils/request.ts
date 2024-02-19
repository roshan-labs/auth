import type { FetchOptions, NuxtApp } from '../types'
import { getAuthApiUrl } from './url'
import { logger } from './logger'

export const request = async <T = any>(
  nuxtApp: NuxtApp,
  path: string,
  options?: FetchOptions,
): Promise<T> => {
  const url = await nuxtApp.runWithContext(() => getAuthApiUrl(path))

  try {
    return $fetch<T>(url, options)
  } catch (error) {
    logger.error(error)
    throw new Error('Runtime fetch error, checkout log to debug')
  }
}
