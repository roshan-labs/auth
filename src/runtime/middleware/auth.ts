import { checkPermission } from '../utils/helper'
import { usePermission } from '../composables/use-permission'
import { defineNuxtRouteMiddleware, navigateTo, useAuth, useRuntimeConfig } from '#imports'

type MiddlewareMeta =
  | false
  | {
      /**
       * 非登录状态访问（访客模式）
       *
       * @default true
       */
      unauthenticatedOnly?: boolean
      /**
       * 已登录跳转地址
       */
      navigateAuthenticatedTo?: string
      /**
       * 未登录跳转地址
       */
      navigateUnauthenticatedTo?: string
      /**
       * 页面权限标识
       */
      permission?: string | string[]
    }

declare module '#app' {
  interface PageMeta {
    auth?: MiddlewareMeta
  }
}

export default defineNuxtRouteMiddleware((to, from) => {
  // 1. 获取 auth meta 配置并设置默认值
  const authMeta = to.meta.auth

  if (authMeta === false) {
    return
  }

  // 2. 访客模式
  const { status } = useAuth()
  const isGuestMode = typeof authMeta === 'object' && authMeta.unauthenticatedOnly

  if (isGuestMode && status.value === 'unauthenticated') {
    return
  }

  // 3. 开发者模式：设置 unauthenticatedOnly 为 false 可以绕过当前路由权限
  if (typeof authMeta === 'object' && authMeta.unauthenticatedOnly === false) {
    return
  }

  // 4. 判断是否登录用户访问
  const authConfig = useRuntimeConfig().public.auth

  if (status.value === 'authenticated') {
    if (isGuestMode) {
      return navigateTo(authMeta.navigateAuthenticatedTo ?? '/')
    }

    // 是否页面权限判断
    if (typeof authMeta?.permission !== 'undefined') {
      const { permissions } = usePermission()
      const permission =
        typeof authMeta.permission === 'string' ? [authMeta.permission] : authMeta.permission
      const isPass = checkPermission(permission, permissions.value)

      if (!isPass) {
        return navigateTo(authConfig.provider.pages.forbidden)
      }
    }

    return
  }

  // 5. 是否忽略 404 页面
  if (
    authConfig.globalAppMiddleware.allow404WithoutAuth ||
    (typeof authConfig.globalAppMiddleware === 'boolean' && authConfig.globalAppMiddleware === true)
  ) {
    const matched = to.matched.length > 0

    // 404
    if (!matched) {
      return
    }
  }

  // 6. 不符合上述条件的最终处理方式
  if (typeof authMeta === 'object' && authMeta.navigateUnauthenticatedTo) {
    return navigateTo(authMeta.navigateUnauthenticatedTo)
  } else {
    // 需要考虑 from 与 login 路径相同的情况，会造成死循环
    return from.path === authConfig.provider.pages.login
      ? undefined
      : navigateTo(authConfig.provider.pages.login)
  }
})
