import type { DeepRequired } from 'ts-essentials'
import {
  addImports,
  addPlugin,
  addRouteMiddleware,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  useLogger,
} from '@nuxt/kit'
import { defu } from 'defu'
import { joinURL } from 'ufo'
import { genInterface } from 'knitwork'

import type { AuthProvider, ModuleOptions, SupportedAuthProviders } from './runtime/types'
import { getOriginAndPathnameFromURL } from './runtime/utils/helper'

export type { ModuleOptions }

const defaultOptions: ModuleOptions = {
  enabled: true,
  session: {
    enableRefreshPeriodically: false,
    enableRefreshOnWindowFocus: true,
  },
  globalAppMiddleware: {
    enabled: false,
    allow404WithoutAuth: true,
    addDefaultCallbackUrl: undefined,
  },
}

const defaultProvider: {
  [key in SupportedAuthProviders]: Extract<AuthProvider, { type: key }>
} = {
  local: {
    type: 'local',
    endpoints: {
      signIn: { path: '/login', method: 'post' },
      signOut: { path: '/logout', method: 'post' },
      signUp: { path: '/register', method: 'post' },
      getSession: { path: '/session', method: 'get' },
    },
    pages: {
      login: '/login',
      forbidden: '/forbidden',
    },
    token: {
      signInResponseTokenPointer: '/token',
      headerName: 'Authorization',
      prefix: 'Bearer',
      maxAgeInSeconds: 30 * 60,
      sameSiteAttribute: 'lax',
    },
    sessionData: {
      type: { id: 'string | number' },
      getSessionResponsePointer: '',
    },
    permissionData: {
      enabled: false,
      getSessionResponsePermissionPointer: '/permission',
    },
    redirectKey: 'redirectUrl',
  },
  authjs: {
    type: 'authjs',
  },
}

const configKey = 'auth'

const PACKAGE_NAME = '@roshan-labs/auth'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@roshan-labs/auth',
    configKey,
  },
  async setup(userOptions, nuxt) {
    const logger = useLogger(PACKAGE_NAME)

    // 1. 合并用户配置与默认配置
    const { origin, pathname = '/api/auth' } = getOriginAndPathnameFromURL(
      userOptions.baseURL ?? '',
    )

    const provider = userOptions.provider?.type ?? 'local'

    const options = {
      ...defu(userOptions, defaultOptions, {
        params: {
          origin,
          pathname,
          fullBaseURL: joinURL(origin ?? '', pathname),
        },
      }),
      provider: defu(userOptions.provider, defaultProvider[provider]) as DeepRequired<AuthProvider>,
    }

    if (!options.enabled) {
      logger.info(`Skipping ${PACKAGE_NAME} setup, as module is not enabled`)
      return
    }

    // 把 options 设置到 runtimeConfig 方便 plugin、middleware、composable 使用
    logger.info(`${PACKAGE_NAME} setup starting`)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    nuxt.options.runtimeConfig.public[configKey] = options

    // 2. 添加 #auth 虚拟模块支持
    const { resolve } = createResolver(import.meta.url)

    if (options.provider.type === 'authjs') {
      nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.alias = nitroConfig.alias || {}
        nitroConfig.alias['#auth'] = resolve('./runtime/server/authjs')
      })
    }

    // 添加类型支持
    addTypeTemplate({
      filename: 'types/auth.d.ts',
      getContents: () =>
        [
          'declare module "#auth" {',
          options.provider.type === 'authjs'
            ? [
                `  const NuxtAuthHandler: typeof import('${resolve(
                  './runtime/server/authjs',
                )}').NuxtAuthHandler`,
                `  const getServerSession: typeof import('${resolve('./runtime/server/authjs')}').getServerSession`,
              ].join('\n')
            : genInterface('SessionData', options.provider.sessionData.type),
          '}',
        ].join('\n'),
    })

    // 3. 自动导入相关 composeable api
    addImports([
      { from: resolve(`./runtime/composables/${options.provider.type}/use-auth`), name: 'useAuth' },
    ])

    // 4. 注册中间件
    addRouteMiddleware({ name: 'auth', path: resolve('./runtime/middleware/auth') })

    // 5. 添加插件
    addPlugin(resolve('./runtime/plugins/auth'))

    if (options.provider.type !== 'authjs' && options.provider.permissionData.enabled) {
      addPlugin(resolve('./runtime/plugins/permission'))
    }

    logger.info(`${PACKAGE_NAME} setup completed`)
  },
})
