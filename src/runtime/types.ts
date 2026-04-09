import type { RouterMethod } from 'h3'
import type { $Fetch } from 'nitropack'
import type { TypeObject } from 'knitwork'
import type { BuiltInProviderType } from '@auth/core/providers'
import type { RuntimeConfig } from '@nuxt/schema'
import type { NuxtApp } from 'nuxt/app'

/** 请求方法类型 */
type Method = NonNullable<NonNullable<Parameters<$Fetch>[1]>['method']>

export type { NuxtApp, RuntimeConfig }

/**
 * 用于枚举字符串类型支持任何其他的字符串参数
 *
 * @example 'foo' | 'bar' -> 'foo' | 'bar' | string
 */
export declare type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>)

/**
 * 客户端 session 配置
 */
type SessionConfig = {
  /**
   * session 刷新频率
   *
   * 设置为 true 每秒刷新一次
   * 设置为 false 则不刷新
   * 设置为 number 则每 number 毫秒刷新一次
   *
   * @default false
   */
  enableRefreshPeriodically?: number | boolean
  /**
   * 是否在每次浏览器 window 重新激活时刷新 session
   *
   * @default true
   */
  enableRefreshOnWindowFocus?: boolean
}

/**
 * 鉴权中间件配置
 */
type GlobalMiddlewareOptions = {
  /**
   * 是否开启全局 auth 中间件
   *
   * @default false
   */
  enabled: boolean
  /**
   * 无登录状态 404 页面是否可访问
   *
   * @default true
   */
  allow404WithoutAuth?: boolean
  /**
   * 添加默认 callbackUrl
   */
  addDefaultCallbackUrl?: string
}

export type SupportedAuthProviders = 'local' | 'authjs'

/**
 * local 策略配置
 */
type ProviderLocal = {
  /**
   * 策略类型
   */
  type: Extract<SupportedAuthProviders, 'local'>
  /**
   * 权限相关的接口请求配置，基于 baseURL 拼接
   *
   * @example baseURL=/api/auth + path=/login = /api/auth/login
   */
  endpoints?: {
    /**
     * 登录 API 配置
     *
     * @default {path:'/login',method:'post'}
     */
    signIn?: { path?: string; method?: Method }
    /**
     * 登出 API 配置
     *
     * @default {path:'/logout',method:'post'}
     */
    signOut?: { path?: string; method?: Method } | false
    /**
     * 注册 API 配置
     *
     * @default {path:'/register',method:'post'}
     */
    signUp?: { path?: string; method?: Method }
    /**
     * 获取用户权限信息 API 配置
     *
     * @default {path:'/session',method:'get'}
     */
    getSession?: { path?: string; method?: Method }
    /**
     * 刷新 token API 配置
     *
     * @default {path:'/refresh',method:'post'}
     */
    refresh?: { path?: string; method?: Method }
  }
  /**
   * 鉴权相关页面配置
   */
  pages?: {
    /**
     * 登录页面路径
     *
     * @default '/login'
     */
    login?: string
    /**
     * 无权限提示页面路径
     *
     * @default '/forbidden'
     */
    forbidden?: string
  }
  /**
   * token 配置
   */
  token?: {
    /**
     * 获取 signIn 接口返回 token 的路径规则
     *
     * @example '/data/token' 会从 signIn 接口返回的 { data: { token: 'token_value' } } 获取到 token 值
     * @default '/token'
     */
    signInResponseTokenPointer?: string
    /**
     * getSession 请求头配置
     *
     * @default 'Authorization'
     */
    headerName?: string
    /**
     * getSession 请求头前缀
     *
     * @default 'Bearer'
     */
    prefix?: string
    /**
     * token 过期时长（秒）
     *
     * @default 1800
     */
    maxAgeInSeconds?: number
    /**
     * token Cookie SameSite 配置
     *
     * @default 'lax'
     */
    sameSiteAttribute?: boolean | CookieSameSite
  }
  /**
   * session data 配置
   */
  sessionData?: {
    /**
     * 配置 getSession 返回数据 TS 类型
     *
     * @default {id:'string|number'}
     */
    type?: TypeObject
    /**
     * 获取 getSession 接口返回 session data 的路径规则
     *
     * @default ''
     */
    getSessionResponsePointer?: string
  }
  /**
   * 用户权限配置
   */
  permissionData?: {
    /**
     * 是否开启获取用户权限配置
     *
     * @example true 同步增加 v-permission 指令和 auth 中间件 permission 参数
     * @default false
     */
    enabled: boolean
    /**
     * 获取 getSession 接口返回用户权限配置的路径规则
     *
     * @default '/permission'
     */
    getSessionResponsePermissionPointer?: string
  }
  /**
   * 刷新 token 配置
   */
  refreshToken?: {
    /**
     * 根据 JSON pointer 规则获取 refreshToken 的路径
     *
     * @default '/refreshToken'
     */
    signInResponseRefreshTokenPointer?: string
    /**
     * refreshToken 过期时长（秒）
     *
     * @default 60 * 60 * 24 * 7
     */
    maxAgeInSeconds?: number
  }
  /**
   * 重定向属性 key
   *
   * @default 'redirectUrl'
   */
  redirectKey?: string
}

/**
 * refresh 策略配置
 */
type ProviderRefresh = Omit<ProviderLocal, 'type'> & {
  /**
   * 策略类型
   */
  type: Extract<SupportedAuthProviders, 'refresh'>
  /**
   * 权限相关的接口请求配置，基于 baseURL 拼接
   *
   * @example baseURL=/api/auth + path=/login = /api/auth/login
   */
  endpoints?: {
    /**
     * 刷新 token api 配置
     *
     * @default {path:'/refresh',method:'post'}
     */
    refresh?: { path?: string; method?: RouterMethod }
  }
  /**
   * 当刷新 token 时，是否只更新 token 而不更新 refreshToken
   *
   * @default true
   */
  refreshOnlyToken?: boolean
  refreshToken?: {
    /**
     * 根据 JSON pointer 规则获取 refreshToken 的路径
     *
     * @default '/refreshToken'
     */
    signInResponseRefreshTokenPointer?: string
    /**
     * refreshToken 过期时长（秒）
     *
     * @default 60 * 60 * 24 * 7
     */
    maxAgeInSeconds?: number
  }
}

export type SupportedProviders = LiteralUnion<BuiltInProviderType> | undefined

/**
 * authjs 策略配置
 */
type ProviderAuth = {
  /**
   * 策略类型
   *
   * @default 'authjs'
   */
  type: Extract<SupportedAuthProviders, 'authjs'>
  /**
   * signIn 未提供 provider 参数时的默认策略
   *
   * @example 'github'
   * @default undefined
   */
  defaultProvider?: SupportedProviders
}

export type AuthProvider = ProviderLocal | ProviderRefresh | ProviderAuth

export interface ModuleOptions {
  /**
   * 是否启用模块
   *
   * @default true
   */
  enabled?: boolean
  /**
   * 鉴权 API baseURL
   *
   * @default '/api/auth'
   */
  baseURL?: string
  /**
   * 鉴权策略
   */
  provider?: AuthProvider
  /**
   * 浏览器 session 配置
   */
  session?: SessionConfig
  /**
   * 鉴权路由中间件配置
   *
   * @example true
   * @example { allow404WithoutAuth: true }
   * @default false
   */
  globalAppMiddleware?: boolean | GlobalMiddlewareOptions
}

type GetSessionOptions = {
  /**
   * 是否强制更新
   */
  force?: boolean
  required?: boolean
  callbackUrl?: string
  external?: boolean
  /**
   * 获取 session 失败时的回调方法
   */
  onUnauthenticated?: () => void
}

export type GetSession<R> = (getSessionOptions?: GetSessionOptions) => Promise<R>

export type SessionStatus = 'unauthenticated' | 'loading' | 'authenticated'

export type FetchOptions = NonNullable<Parameters<$Fetch>[1]>

/** `request()` 第三参数；按 `options.method`（未写视为 GET）映射到 $fetch 的 `query` 或 `body` */
export type RequestData = unknown

export type SignOptions = {
  /**
   * 是否重定向
   *
   * @default true
   */
  redirect?: boolean
  /**
   * 重定向地址
   */
  callbackUrl?: string
  /**
   * callbackUrl 是否外链，signIn 调用后会刷新页面
   *
   * @default false
   */
  external?: boolean
} & Record<string, any>

export type SignIn<P, R> = (
  primaryOptions: P,
  signInOptions?: SignOptions,
  fetchOptions?: FetchOptions,
) => Promise<R>

export type SignUp<P, R> = SignIn<P, R>

export type SignOut<R> = (signOutOptions?: SignOptions, fetchOptions?: FetchOptions) => Promise<R>

export type Refresh<P> = (primaryOptions: P, fetchOptions?: FetchOptions) => Promise<void>
