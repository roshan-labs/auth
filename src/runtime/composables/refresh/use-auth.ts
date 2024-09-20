import { defu } from 'defu'

import type { Refresh } from '../../types'
import { jsonPointerGet, useTypedConfig } from '../../utils/helper'
import { useAuthFetch } from '../use-auth-fetch'
import { logger } from '../../utils/logger'
import { useAuth as useLocalAuth } from '../local/use-auth'
import { useAuthState } from './use-auth-state'
import { navigateTo, useRuntimeConfig } from '#imports'

/**
 * 请求用户权限数据
 */
const getSession: ReturnType<typeof useLocalAuth>['getSession'] = async (
  getSessionOptions = {},
) => {
  const config = useTypedConfig(useRuntimeConfig(), 'refresh')

  const { token, refreshToken, lastRefreshedAt } = useAuthState()

  if (!token.value && !getSessionOptions.force) {
    return
  }
  if (token.value && refreshToken.value && lastRefreshedAt && lastRefreshedAt.value) {
    const isTokenExpired =
      new Date().getTime() - lastRefreshedAt.value.getTime() > config.token.maxAgeInSeconds * 1000
    if (isTokenExpired) {
      await refresh({ refreshToken: refreshToken.value })
      return
    }
  }
  const { getSession } = useLocalAuth()
  return await getSession()
}
/**
 * 登录
 */
const signIn: ReturnType<typeof useLocalAuth>['signIn'] = async (
  credentials,
  signInOptions = {},
  fetchOptions,
) => {
  // 1. 获取 refresh 配置
  const config = useTypedConfig(useRuntimeConfig(), 'refresh')

  // 2. 发起 signIn 请求
  const { path, method } = config.endpoints.signIn

  const response = await useAuthFetch(path, credentials, method, fetchOptions)

  // 3. 获取 token
  const expectedToken = jsonPointerGet(response, config.token.signInResponseTokenPointer)

  if (typeof expectedToken !== 'string') {
    logger.error(
      `Auth: string token expected, received instead: ${JSON.stringify(
        expectedToken,
      )}. Tried to find token at ${config.token.signInResponseTokenPointer} in ${JSON.stringify(
        response,
      )}`,
    )
    return
  }

  // 4. 获取 refreshToken
  const expectedRefreshToken = jsonPointerGet(
    response,
    config.refreshToken.signInResponseRefreshTokenPointer,
  )

  if (typeof expectedRefreshToken !== 'string') {
    logger.error(
      `Auth: string token expected, received instead: ${JSON.stringify(
        expectedRefreshToken,
      )}. Tried to find token at ${
        config.refreshToken.signInResponseRefreshTokenPointer
      } in ${JSON.stringify(response)}`,
    )
    return
  }

  // 5. 设置 token 与 refreshToken 并获取 sessionData
  const { setToken, setRefreshToken } = useAuthState()
  const { getSession } = useLocalAuth()

  setToken(expectedToken)
  setRefreshToken(expectedRefreshToken)
  await getSession()

  // 6. 上述成功后是否重定向
  const { redirect = true, callbackUrl, external } = signInOptions

  if (redirect) {
    return navigateTo(callbackUrl ?? '/', { external })
  }
}

/**
 * 登出
 */
const signOut: ReturnType<typeof useLocalAuth>['signOut'] = async (
  signOutOptions = {},
  fetchOptions,
) => {
  // 1. 获取 signOut endpoint 配置
  const config = useTypedConfig(useRuntimeConfig(), 'refresh')
  const signOutConfig = config.endpoints.signOut
  const { token, data, lastRefreshedAt, clearToken, clearRefreshToken } = useAuthState()
  let response

  // 2. 发起 signOut 请求
  if (signOutConfig) {
    const { path, method } = signOutConfig
    const headers = new Headers(
      token.value ? { [config.token.headerName]: token.value } : undefined,
    )

    response = await useAuthFetch(path, undefined, method, defu(fetchOptions, { headers }))
  }

  // 3. 清理 token, refreshToken, session
  data.value = null
  lastRefreshedAt.value = null
  clearToken()
  clearRefreshToken()

  // 4. signOut 之后是否需要重定向到其他地址
  const { redirect = true, callbackUrl, external } = signOutOptions

  if (redirect) {
    await navigateTo(callbackUrl ?? config.pages.login, { external })
  }

  return response
}

/**
 * 刷新 token
 */
const refresh: Refresh<Record<string, any>> = async (credentials, fetchOptions) => {
  // 1. 获取 refresh 请求配置
  const config = useTypedConfig(useRuntimeConfig(), 'refresh')
  const { path, method } = config.endpoints.refresh
  const { token, lastRefreshedAt, setToken, setRefreshToken } = useAuthState()
  const { getSession } = useLocalAuth()

  // 2. 发送 refresh 请求
  const headers = new Headers(token.value ? { [config.token.headerName]: token.value } : undefined)

  const response = await useAuthFetch(path, credentials, method, defu(fetchOptions, { headers }))

  // 3. 获取新 token
  const expectedToken = jsonPointerGet(response, config.token.signInResponseTokenPointer)

  if (typeof expectedToken !== 'string') {
    logger.error(
      `Auth: string token expected, received instead: ${JSON.stringify(
        expectedToken,
      )}. Tried to find token at ${config.token.signInResponseTokenPointer} in ${JSON.stringify(
        response,
      )}`,
    )
    return
  }

  // 4. 获取新 refreshToken
  if (!config.refreshOnlyToken) {
    const expectedRefreshToken = jsonPointerGet(
      response,
      config.refreshToken.signInResponseRefreshTokenPointer,
    )

    if (typeof expectedRefreshToken !== 'string') {
      logger.error(
        `Auth: string token expected, received instead: ${JSON.stringify(
          expectedRefreshToken,
        )}. Tried to find token at ${
          config.refreshToken.signInResponseRefreshTokenPointer
        } in ${JSON.stringify(response)}`,
      )
      return
    } else {
      setRefreshToken(expectedRefreshToken)
    }
  }

  // 5. 设置新 token 并更新时间
  setToken(expectedToken)

  await getSession()
  lastRefreshedAt.value = new Date()
}

type UseAuthReturn = ReturnType<typeof useAuthState> &
  ReturnType<typeof useLocalAuth> & {
    refresh: typeof refresh
  }

export const useAuth = (): UseAuthReturn => {
  const localAuth = useLocalAuth()

  localAuth.getSession = getSession
  localAuth.signIn = signIn
  localAuth.signOut = signOut

  const state = useAuthState()

  return {
    ...localAuth,
    ...state,
    refresh,
  }
}
