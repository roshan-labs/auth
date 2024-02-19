import { defu } from 'defu'

import type { GetSession, SignIn, SignOut, SignUp } from '../../types'
import { jsonPointerGet, useTypedConfig } from '../../utils/helper'
import { logger } from '../../utils/logger'
import { useAuthFetch } from '../use-auth-fetch'
import { useAuthState } from './use-auth-state'
import type { SessionData } from '#auth'
import { navigateTo, useRuntimeConfig } from '#imports'

/**
 * 请求用户权限数据
 */
const getSession: GetSession<SessionData | null | void> = async (getSessionOptions = {}) => {
  const config = useTypedConfig(useRuntimeConfig(), 'local')
  const { path, method } = config.endpoints.getSession

  const { token, loading, data, lastRefreshedAt, clearToken } = useAuthState()

  if (!token.value && !getSessionOptions.force) {
    return
  }

  const headers = new Headers(token.value ? { [config.token.headerName]: token.value } : undefined)

  loading.value = true

  try {
    const response = await useAuthFetch<Record<string, any>>(path, undefined, method, { headers })

    // 根据 JSON pointer 获取正确的 sessionData
    data.value = jsonPointerGet(response, config.sessionData.sessionPointer) as SessionData
  } catch (error) {
    // 获取 sessionData 出错需要重置登录状态
    logger.error(error)
    data.value = null
    clearToken()
  }

  loading.value = false
  lastRefreshedAt.value = new Date()

  // 获取用户信息失败后可以进行的操作
  const { required = false, callbackUrl, external, onUnauthenticated } = getSessionOptions

  if (required && data.value === null) {
    if (onUnauthenticated) {
      return onUnauthenticated()
    } else {
      await navigateTo(callbackUrl ?? '/', { external })
    }
  }

  return data.value
}

type Credentials = {
  username?: string
  email?: string
  password?: string
} & Record<string, any>

/**
 * 发起鉴权
 */
const signIn: SignIn<Credentials, any> = async (credentials, signInOptions = {}, fetchOptions) => {
  const config = useTypedConfig(useRuntimeConfig(), 'local')
  const { path, method } = config.endpoints.signIn

  const response = await useAuthFetch<Record<string, any>>(path, credentials, method, fetchOptions)
  const token = jsonPointerGet(response, config.token.signInResponseTokenPointer)

  if (typeof token !== 'string') {
    logger.error(
      `Auth: string token expected, received instead: ${JSON.stringify(
        token,
      )}. Tried to find token at ${config.token.signInResponseTokenPointer} in ${JSON.stringify(
        response,
      )}`,
    )
    return
  }

  useAuthState().setToken(token)
  await getSession()

  const { redirect = true, callbackUrl, external } = signInOptions

  if (redirect) {
    return navigateTo(callbackUrl ?? '/', { external })
  }
}

/**
 * 注册
 */
const signUp: SignUp<Credentials, any> = async (credentials, signUpOptions = {}, fetchOptions) => {
  const config = useTypedConfig(useRuntimeConfig(), 'local')
  const { path, method } = config.endpoints.signUp

  await useAuthFetch(path, credentials, method, fetchOptions)

  return signIn(credentials, signUpOptions)
}

/**
 * 登出
 */
const signOut: SignOut<any> = async (signOutOptions = {}, fetchOptions) => {
  const config = useTypedConfig(useRuntimeConfig(), 'local')
  const { data, token, lastRefreshedAt, clearToken } = useAuthState()
  const headers = new Headers(token.value ? { [config.token.headerName]: token.value } : undefined)

  // 清理登录用户信息
  data.value = null
  lastRefreshedAt.value = null
  clearToken()

  const signOutConfig = config.endpoints.signOut
  let response = null

  if (signOutConfig) {
    const { path, method } = signOutConfig

    response = await useAuthFetch(path, undefined, method, defu(fetchOptions, { headers }))
  }

  // 处理 signOutOptions
  const { redirect = true, callbackUrl, external } = signOutOptions

  if (redirect) {
    await navigateTo(callbackUrl ?? config.pages.login, { external })
  }

  return response
}

type UseAuthReturn = {
  getSession: typeof getSession
  signIn: typeof signIn
  signUp: typeof signUp
  signOut: typeof signOut
} & ReturnType<typeof useAuthState>

export const useAuth = (): UseAuthReturn => {
  const authState = useAuthState()

  return {
    ...authState,
    getSession,
    signIn,
    signUp,
    signOut,
  }
}
