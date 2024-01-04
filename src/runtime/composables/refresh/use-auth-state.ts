import { useTypedConfig } from '../../utils/helper'
import { useAuthState as useLocalAuthState } from '../local/use-auth-state'
import { computed, useCookie, useRuntimeConfig, useState, watch } from '#imports'

export const useAuthState = () => {
  const localAuthState = useLocalAuthState()

  const config = useTypedConfig(useRuntimeConfig(), 'refresh')

  const _refreshTokenCookie = useCookie<string | null>('auth:refresh-token', {
    default: () => null,
    maxAge: config.refreshToken.maxAgeInSeconds,
    sameSite: 'lax',
  })

  const rawRefreshToken = useState('auth:raw-refresh-token', () => _refreshTokenCookie.value)

  const refreshToken = computed(() => rawRefreshToken.value)

  watch(rawRefreshToken, (value) => {
    _refreshTokenCookie.value = value
  })

  const setRefreshToken = (value: string) => {
    rawRefreshToken.value = value
  }

  const clearRefreshToken = () => {
    rawRefreshToken.value = null
  }

  return {
    ...localAuthState,
    refreshToken,
    setRefreshToken,
    clearRefreshToken,
  }
}
