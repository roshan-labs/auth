import type { AuthConfig, Session } from '@auth/core/types'
import { Auth, setEnvDefaults } from '@auth/core'
import { type H3Event, defineEventHandler, getRequestHeaders } from 'h3'
import { joinURL } from 'ufo'

import { getWebRequest } from '../utils/server'
import { useRuntimeConfig } from '#imports'

// Node.js 20 之后版本才有 globalThis.crypto，需要做兼容
if (!globalThis.crypto) {
  import('node:crypto').then((crypto) => {
    Object.defineProperty(globalThis, 'crypto', {
      value: crypto.webcrypto,
      writable: false,
      configurable: true,
    })
  })
}

export const NuxtAuthHandler = (options: AuthConfig) => {
  return defineEventHandler(async (event) => {
    // 忽略 sourcemap 文件
    if (event.node.req.url?.includes('.js.map')) return
    // 忽略 prerender 请求
    if (event.node.req.headers?.['x-nitro-prerender'] && import.meta.env.NODE_ENV === 'prerender')
      return

    const request = await getWebRequest(event)

    // 默认信任 host
    options.trustHost ??= true
    // 设置 basePath
    options.basePath ??= useRuntimeConfig().public.auth.params.pathname

    setEnvDefaults(process.env, options)

    return await Auth(request, options)
  })
}

export const getServerSession = async (event: H3Event) => {
  const { pathname } = useRuntimeConfig().public.auth.params

  if (event.path && event.path.startsWith(pathname)) {
    return null
  }

  const url = joinURL(pathname, 'session')
  const headers = getRequestHeaders(event) as HeadersInit
  let session: Session | null = null

  try {
    session = await $fetch<Session>(url, { headers })

    return session || null
  } catch {
    throw new Error('Get server session error')
  }
}

// export const getServerToken = (event: H3Event, options: AuthConfig) => {
//   return getToken({
//     req: {
//       // @ts-ignore
//       cookies: parseCookies(event),
//       headers: getRequestHeaders(event) as Record<string, string>,
//     },
//     secret: getAuthSecret(options),
//     secureCookie: getServerOrigin(event, useRuntimeConfig()).startsWith('https://'),
//   })
// }
