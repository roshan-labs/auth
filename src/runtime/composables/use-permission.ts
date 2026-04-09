import type { ComputedRef } from 'vue'

import { jsonPointerGet } from '../utils/helper'
import { logger } from '../utils/logger'
import { computed, useAuth, useRuntimeConfig } from '#imports'

type UsePermissionReturn = {
  permissions: ComputedRef<string[]>
}

export const usePermission = (): UsePermissionReturn => {
  const { data } = useAuth()
  const { getSessionResponsePermissionPointer } =
    useRuntimeConfig().public.auth.provider.permissionData

  const permissions = computed(() => {
    if (data.value) {
      const list = jsonPointerGet(data.value, getSessionResponsePermissionPointer) as string[]

      if (Array.isArray(list)) {
        return list
      }

      logger.error(
        `Permission: string array permission expected, received instead: ${JSON.stringify(list)}`,
      )
    }

    return []
  })

  return {
    permissions,
  }
}
