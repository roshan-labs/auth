import type { FetchOptions, NuxtApp, RequestData } from '../types'
import { getAuthApiUrl } from './url'
import { logger } from './logger'

const resolveMethod = (options?: FetchOptions) => {
  const m = options?.method
  if (m === undefined || m === null) {
    return 'GET'
  }
  return String(m).toUpperCase()
}

const methodUsesQuery = (method: string) => method === 'GET' || method === 'HEAD'

export const request = async <T = any>(
  nuxtApp: NuxtApp,
  path: string,
  data?: RequestData,
  options?: FetchOptions,
): Promise<T> => {
  const url = await nuxtApp.runWithContext(() => getAuthApiUrl(path))
  const fetchOptions: FetchOptions = { ...options }

  if (data !== undefined) {
    const method = resolveMethod(options)
    if (methodUsesQuery(method)) {
      fetchOptions.query = data as FetchOptions['query']
    } else {
      fetchOptions.body = data as FetchOptions['body']
    }
  }

  try {
    return $fetch<T>(url, fetchOptions)
  } catch (error) {
    logger.error(error)
    throw new Error('Runtime fetch error, checkout log to debug')
  }
}
