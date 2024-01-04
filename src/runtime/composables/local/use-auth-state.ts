import { useCommonAuthState } from '../use-common-auth-state'
import { useTypedConfig } from '../../utils/helper'
import type { SessionData } from '#auth'
import { computed, useCookie, useRuntimeConfig, useState, watch } from '#imports'

export const useAuthState = () => {
  const config = useTypedConfig(useRuntimeConfig(), 'local')

  const commonAuthState = useCommonAuthState<SessionData>()

  /** token cookie */
  const _tokenCookie = useCookie<string | null>('auth:token', {
    default: () => null,
    maxAge: config.token.maxAgeInSeconds,
    sameSite: config.token.sameSiteAttribute,
  })

  // useCookie 的更新机制会延迟
  // 这里需要创建一个响应式变量同步
  /** token global state */
  const rawToken = useState('auth:raw-token', () => _tokenCookie.value)

  watch(rawToken, (value) => {
    _tokenCookie.value = value
  })

  const token = computed(() => {
    if (rawToken.value === null) return null
    return config.token.type.length > 0 ? `${config.token.type} ${rawToken.value}` : rawToken.value
  })

  const setToken = (value: string | null) => {
    rawToken.value = value
  }

  const clearToken = () => {
    setToken(null)
  }

  return {
    ...commonAuthState,
    token,
    setToken,
    clearToken,
  }
}
