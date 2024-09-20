import { joinURL } from 'ufo'

import type { RuntimeConfig } from '../types'
import { navigateTo, reloadNuxtApp, useRequestURL, useRuntimeConfig } from '#imports'

/**
 * 根据 path 得出结合 auth baseURL 路径
 *
 * @param path 路径
 * @returns 完整的 auth url
 */
export const getAuthApiUrl = (path: string) => {
  return joinURL(useRuntimeConfig().public.auth.params.fullBaseURL, path)
}

/**
 * 获取当前请求的完整 url
 *
 * @returns url
 */
export const getRequestUrl = () => useRequestURL().href

/**
 * 获取默认 callback url
 *
 * @param authProvider authjs provider 配置
 * @param defaultCallback 设置默认 callback url
 * @returns callback url
 */
export const getDefaultCallbackUrl = <T extends string | Promise<string>>(
  authConfig: RuntimeConfig['public']['auth'],
  defaultCallback: () => T,
) => {
  const defaultCallbackUrl = authConfig.globalAppMiddleware.addDefaultCallbackUrl

  if (typeof defaultCallbackUrl === 'string' && defaultCallbackUrl) {
    return defaultCallbackUrl
  }

  return defaultCallback()
}

/**
 * 导航页面（刷新页面）
 *
 * @param url authjs 内部页面地址
 */
export const navigateToAuthPage = async (url: string) => {
  await navigateTo(url, { external: true })

  if (url.includes('#')) {
    reloadNuxtApp({ persistState: true, force: true })
  }
}
