import type { AppProvider } from '@auth/core/providers'

import type { GetSession, SignOptions, SupportedProviders } from '../../types'
import { logger } from '../../utils/logger'
import { isNonEmptyObject, useTypedConfig } from '../../utils/helper'
import {
  getAuthApiUrl,
  getDefaultCallbackUrl,
  getRequestUrl,
  navigateToAuthPage,
} from '../../utils/url'
import { request } from '../../utils/request'
import { type SessionData, useAuthState } from './use-auth-state'
import {
  reloadNuxtApp,
  useNuxtApp,
  useRequestHeaders,
  useRequestURL,
  useRuntimeConfig,
} from '#imports'

/**
 * 获取设置的 provider 配置对象
 *
 * @returns 通过 [...].{js,ts} 设置的 providers 配置对象
 */
const getProviders = () =>
  request<Record<Exclude<SupportedProviders, undefined>, AppProvider>>(useNuxtApp(), '/providers/')

const getSession: GetSession<SessionData | null> = async (options) => {
  const nuxtApp = useNuxtApp()

  const headers = useRequestHeaders()
  const callbackUrlFallback = getRequestUrl()
  const { loading, lastRefreshedAt, data, status } = useAuthState()
  const {
    required,
    callbackUrl,
    onUnauthenticated = () =>
      signIn(undefined, { callbackUrl: options?.callbackUrl || callbackUrlFallback }),
  } = options || {}

  loading.value = true

  try {
    const response = await request(nuxtApp, '/session', {
      headers,
      method: 'get',
      params: { callbackUrl: callbackUrl || callbackUrlFallback },
    })

    data.value = isNonEmptyObject(response) ? response : null
  } catch (error) {
    logger.error(error)
    data.value = null
  }

  loading.value = false
  lastRefreshedAt.value = new Date()

  if (required && status.value === 'unauthenticated') {
    onUnauthenticated()
  }

  return data.value
}

type SignInAuthorizationParams = string | string[][] | Record<string, string> | URLSearchParams
type SignInReturn = Promise<{
  error: string | null
  status: number
  ok: boolean
  url: string
} | void>

export const signIn = async (
  provider?: SupportedProviders,
  signInOptions: SignOptions = {},
  authorizationParams?: SignInAuthorizationParams,
): SignInReturn => {
  const nuxtApp = useNuxtApp()

  // 1. 检查 NuxtAuthHandler providers 策略配置
  const providers = await getProviders()

  if (Object.keys(providers).length === 0) {
    logger.error('Auth: providers parameter is not set')
    return
  }

  // 2. provider 传入 undefined 时取默认策略
  const authConfig = await nuxtApp.runWithContext(() =>
    useTypedConfig(useRuntimeConfig(), 'authjs'),
  )

  if (typeof provider === 'undefined') {
    provider = authConfig.defaultProvider
  }

  // 3. provider 为 undefined 时需要重定向到 authjs 默认 sign in 页面
  const { redirect = true } = signInOptions
  let { callbackUrl } = signInOptions

  if (typeof callbackUrl === 'undefined') {
    const requestCallbackUrl = useRequestURL().searchParams.get('callbackUrl') ?? ''

    callbackUrl = await nuxtApp.runWithContext(() =>
      getDefaultCallbackUrl(useRuntimeConfig().public.auth, () => requestCallbackUrl),
    )
  }

  // defaultProvider 未设置时跳转到 authjs 默认登录选择页面
  const signInUrl = await nuxtApp.runWithContext(() => getAuthApiUrl('signin'))
  const queryParams = callbackUrl ? `?${new URLSearchParams({ callbackUrl })}` : ''
  const signInHref = `${signInUrl}${queryParams}`

  if (!provider) {
    return await nuxtApp.runWithContext(() => navigateToAuthPage(signInHref))
  }

  // 未找到输入的 provider 配置也应该跳转到 authjs 默认登录选择页面
  const selectedProvider = providers[provider]

  if (!selectedProvider) {
    return await nuxtApp.runWithContext(() => navigateToAuthPage(signInHref))
  }

  // 4. 获取 csrf token
  const { csrfToken } = await request<{ csrfToken: string }>(nuxtApp, '/csrf')

  if (!csrfToken) {
    throw new Error('CSRF token not found')
  }

  // 4. 发起 signin 请求
  const isCredentials = selectedProvider.type === 'credentials'
  const isEmail = selectedProvider.type === 'email'
  const isSupportReturn = isCredentials || isEmail

  // 准备请求相关参数
  const action = isCredentials ? 'callback' : 'signin'
  const url = `/${action}/${provider}?${new URLSearchParams(authorizationParams)}`
  const headers = new Headers({
    'content-type': 'application/x-www-form-urlencoded',
    'x-auth-return-redirect': '1',
  })
  // @ts-ignore
  const params = new URLSearchParams({
    ...signInOptions,
    csrfToken,
    callbackUrl,
  })

  const response = await request<{ url: string }>(nuxtApp, url, {
    headers,
    method: 'post',
    body: params,
  })

  const error = new URL(response.url).searchParams.get('error')

  if (!error && isCredentials && !redirect) {
    reloadNuxtApp({ persistState: true, force: true })
    return
  }

  if (redirect || !isSupportReturn) {
    const href = response.url ?? callbackUrl

    return await nuxtApp.runWithContext(() => navigateToAuthPage(href))
  }

  return {
    error,
    status: 200,
    ok: true,
    url: response.url,
  }
}

type SignOutOptions = Pick<SignOptions, 'redirect' | 'callbackUrl'>
type SignOutReturn = Promise<{ url: string } | void>

const signOut = async (options?: SignOutOptions): SignOutReturn => {
  const nuxtApp = useNuxtApp()

  const requestUrl = getRequestUrl()
  const { redirect = true, callbackUrl = requestUrl } = options ?? {}

  const { csrfToken } = await request<{ csrfToken: string }>(nuxtApp, '/csrf')

  if (!csrfToken) {
    throw new Error('CSRF token not found')
  }

  const response = await request<{ url: string }>(nuxtApp, '/signout', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-auth-return-redirect': '1',
    },
    body: new URLSearchParams({ csrfToken, callbackUrl }),
  })

  if (redirect) {
    const url = response.url ?? callbackUrl
    return navigateToAuthPage(url)
  }

  await getSession()

  return response
}

export const useAuth = () => {
  const state = useAuthState()

  return {
    ...state,
    getProviders,
    getSession,
    signIn,
    signOut,
  }
}
