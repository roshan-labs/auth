import type { RouterMethod } from 'h3'
import { joinURL } from 'ufo'
import { defu } from 'defu'

import type { FetchOptions } from '../types'
import { useLogger } from './use-logger'
import { useHttp, useRuntimeConfig } from '#imports'

/**
 * 结合 baseURL 发起请求
 *
 * @param path endpoints 配置的 path
 * @param params 请求参数
 * @param method 请求方式，@roshan-labs/http 只支持四种
 * @param options $fetch 选项配置
 * @returns 接口返回数据
 */
export const useAuthFetch = <R = any>(
  path: string,
  params: Record<string, any> | undefined,
  method: RouterMethod,
  options?: FetchOptions
): Promise<R> => {
  const baseURL = useRuntimeConfig().public.auth.params.fullBaseURL
  const url = joinURL(baseURL, path)

  try {
    // TODO: @roshan-labs/http 模块需要支持全部 RouterMethod 类型请求
    return useHttp()[method as 'get' | 'post' | 'put' | 'delete'](
      url,
      params,
      defu(options, {
        baseURL: '',
      })
    )
  } catch (error) {
    useLogger().error(error)
    throw new Error('Runtime fetch error, checkout log to debug')
  }
}
