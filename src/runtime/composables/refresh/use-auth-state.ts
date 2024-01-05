import { type ComputedRef, computed, watch } from 'vue'

import { useTypedConfig } from '../../utils/helper'
import { useAuthState as useLocalAuthState } from '../local/use-auth-state'
import { useCookie, useRuntimeConfig, useState } from '#imports'

type UseAuthStateReturn = {
  refreshToken: ComputedRef<string | null>
  setRefreshToken: (value: string | null) => void
  clearRefreshToken: () => void
} & ReturnType<typeof useLocalAuthState>

export const useAuthState = (): UseAuthStateReturn => {
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

  const setRefreshToken = (value: string | null) => {
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
