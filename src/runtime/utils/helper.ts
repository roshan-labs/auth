import type { DeepRequired } from 'ts-essentials'
import { parseURL } from 'ufo'

import type { AuthProvider, SupportedAuthProviders } from '../types'
import { useRuntimeConfig } from '#imports'

/**
 * 判断 value 中是否有值包含在 permissions 数组中
 *
 * @param value 待验证的权限标签数组
 * @param permissions 完整的权限标签数组
 * @returns 权限是否通过
 */
export const checkPermission = (value: string[], permissions: string[]) =>
  value.some((item) => permissions.includes(item))

/**
 * 转义 JSON pointer 字符串为 key 数组
 *
 * @param pointer JSON pointer
 * @returns key 数组
 */
const pointerParse = (pointer: string) => {
  if (pointer === '') return []
  if (pointer.at(0) !== '/') throw new Error(`Invalid JSON pointer: ${pointer}`)

  return pointer
    .slice(1)
    .split(/\//)
    .map((item) => item.replace(/~1/g, '/').replace(/~0/g, '~'))
}

/**
 * 根据 JSON pointer 规则获取对象属性
 *
 * @param target 目标对象
 * @param pointer JSON pointer
 * @returns 属性值
 */
export const jsonPointerGet = (
  target: Record<string, any>,
  pointer: string
): string | Record<string, any> => {
  const refTokens = pointerParse(pointer)

  for (let index = 0; index < refTokens.length; index++) {
    const token = refTokens[index]

    if (!(typeof target === 'object' && token in target)) {
      throw new Error(`Invalid reference token: ${token}`)
    }

    target = target[token]
  }

  return target
}

/**
 * 获取 url 中的 origin 和 pathname
 *
 * @param url url 地址
 * @returns origin, pathname 信息
 */
export const getOriginAndPathnameFromURL = (url: string) => {
  const { protocol, host, pathname } = parseURL(url)

  let origin

  if (protocol && host) {
    origin = `${protocol}//${host}`
  }

  const _pathname = pathname.length > 0 ? pathname : undefined

  return {
    origin,
    pathname: _pathname,
  }
}

/**
 * 获取 type 类型策略配置
 *
 * @param runtimeConfig nuxt runtime config
 * @param _type 策略类型
 * @returns type 类型策略配置
 */
export const useTypedConfig = <T extends SupportedAuthProviders>(
  runtimeConfig: ReturnType<typeof useRuntimeConfig>,
  _type: T
): Extract<DeepRequired<AuthProvider>, { type: T }> => runtimeConfig.public.auth.provider as any
