import type { AuthConfig } from '@auth/core/types'
import { type H3Event, getRequestURL, getRequestHeaders, readRawBody } from 'h3'

import type { RuntimeConfig } from '../types'

/**
 * 从 event 构造出标准 Request 对象
 *
 * @param event h3 event
 * @returns Request
 */
export const getWebRequest = async (event: H3Event) => {
  const url = getRequestURL(event)
  const { method } = event
  const headers = getRequestHeaders(event) as HeadersInit
  // get 和 head 请求不接受 body 参数
  // readRawBody 需要注意不同源的情况下可能会报错，不接受 URLSearchParams 类型 body
  const body = /GET|HEAD/.test(method) ? undefined : await readRawBody(event)

  return new Request(url, { method, headers, body })
}

/**
 * 获取 Auth.js secret 参数
 *
 * @param options Auth.js options 配置
 * @returns secret 参数
 */
export const getAuthSecret = (options: AuthConfig) => {
  const secret = options.secret || null

  if (!secret) {
    throw new Error('No Auth.js secret found')
  }

  return secret
}

/**
 * 获取服务来源
 *
 * @param event h3 event
 * @returns origin
 */
export const getServerOrigin = (event: H3Event, runtimeConfig: RuntimeConfig) => {
  const requestOrigin = getRequestHeaders(event).origin
  const serverOrigin = runtimeConfig.public.auth.params.origin as string | undefined
  const origin = requestOrigin ?? serverOrigin

  if (!origin) {
    throw new Error('No Origin found')
  }

  return origin
}

/**
 * 获取 request path，去除尾部 /
 *
 * @param req Request 请求
 * @returns 格式化后的 request path
 */
export const getBasePath = (req: Request) => {
  return req.url.replace(/\/$/, '')
}
