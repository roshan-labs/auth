import authMiddleware from '../middleware/auth'
import { addRouteMiddleware, defineNuxtPlugin, useAuth, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: '@roshan-labs/auth',
  enforce: 'pre',
  async setup(nuxtApp) {
    // 1. 初始化变量，调用 getSession 获取用户权限数据
    const config = useRuntimeConfig().public.auth
    const { data, lastRefreshedAt, getSession } = useAuth()

    if (data.value === null) {
      await getSession()
    }

    // 2. 配置 session 刷新规则
    let refetchIntervalTimer: number | null = null
    const { enableRefreshPeriodically, enableRefreshOnWindowFocus } = config.session

    // 如果配置 enableRefreshOnWindowFocus 为 true，则在每次 window 激活的时候重新获取 session
    const onVisibilitychange = () => {
      if (document.visibilityState === 'visible') {
        getSession()
      }
    }

    nuxtApp.hook('app:mounted', () => {
      if (enableRefreshOnWindowFocus) {
        document.addEventListener('visibilitychange', onVisibilitychange, false)
      }

      // 设置定时刷新 session
      if (enableRefreshPeriodically !== false) {
        const intervalTime: number =
          typeof enableRefreshPeriodically === 'boolean' ? 1000 : enableRefreshPeriodically

        refetchIntervalTimer = window.setInterval(() => {
          if (data.value) {
            getSession()
          }
        }, intervalTime)
      }
    })

    // 在应用卸载时清理 session 相关事件
    const _unmount = nuxtApp.vueApp.unmount

    nuxtApp.vueApp.unmount = () => {
      // 清除 visibilitychange 事件
      if (enableRefreshOnWindowFocus) {
        document.removeEventListener('visibilitychange', onVisibilitychange)
      }

      // 清除刷新 session 定时器
      if (refetchIntervalTimer !== null) {
        window.clearInterval(refetchIntervalTimer)
      }

      // 清除 session
      data.value = null
      lastRefreshedAt.value = null

      _unmount()
    }

    // 3. 按配置判断是否注册全局路由中间件
    const { globalAppMiddleware } = config

    if (
      (typeof globalAppMiddleware === 'boolean' && globalAppMiddleware === true) ||
      globalAppMiddleware.isEnabled
    ) {
      addRouteMiddleware('auth', authMiddleware, { global: true })
    }
  },
})
