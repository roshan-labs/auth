import type { Directive } from 'vue'

import { checkPermission } from '../utils/helper'
import { usePermission } from '../composables/use-permission'
import { defineNuxtPlugin } from '#imports'

type DirectiveConfig = Directive<HTMLElement, string[] | string>

declare module 'vue' {
  interface ComponentCustomProperties {
    vPermission: DirectiveConfig
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  // 1. 从 sessionData 中获取用户权限数据
  const { permissions } = usePermission()

  // 2. 注册 v-permission 指令
  nuxtApp.vueApp.directive<HTMLElement, string | string[]>('permission', {
    mounted(el, binding) {
      const value = Array.isArray(binding.value) ? binding.value : [binding.value]

      const result = checkPermission(value, permissions.value)

      if (!result) {
        el.remove()
      }
    },
  })
})
