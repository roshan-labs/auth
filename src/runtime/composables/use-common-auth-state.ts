import type { Ref, ComputedRef } from 'vue'

import type { SessionStatus } from '../types'
import { computed, useState } from '#imports'

type UseCommonAuthStateReturn<T> = {
  loading: Ref<boolean>
  data: Ref<T | null>
  lastRefreshedAt: Ref<Date | null>
  status: ComputedRef<SessionStatus>
}

/**
 * 公共 auth 状态方法
 *
 * @returns auth 相关状态变量与方法
 */
export const useCommonAuthState = <T = any>(): UseCommonAuthStateReturn<T> => {
  /** 登录用户数据 */
  const data = useState<T | null>('auth:data', () => null)

  /** 是否已获取登录用户数据 */
  const _sessionReady = computed(() => !!data.value)

  /** 最后获取登录用户数据时间 */
  const lastRefreshedAt = useState('auth:last-refreshed-at', () => {
    if (_sessionReady.value) {
      return new Date()
    }

    return null
  })

  /** 是否正在请求登录用户数据 */
  const loading = useState('auth:loading', () => false)

  /** 当前 auth 模块状态 */
  const status = computed<SessionStatus>(() => {
    if (loading.value) {
      return 'loading'
    } else if (data.value) {
      return 'authenticated'
    }

    return 'unauthenticated'
  })

  return {
    data,
    lastRefreshedAt,
    loading,
    status,
  }
}
