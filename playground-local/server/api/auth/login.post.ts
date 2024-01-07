import { z } from 'zod'
import { sign } from 'jsonwebtoken'

export const SECRET = 'roshan-labs'

export default defineEventHandler(async (event) => {
  // 1. 校验 body 参数
  const result = await readValidatedBody(
    event,
    z.object({ username: z.string().min(1), password: z.literal('123') }).safeParse
  )

  // 2. 参数错误抛出错误
  if (!result.success) {
    throw createError({ status: 403, statusMessage: 'username or password wrong' })
  }

  // 3. 生成 token
  const authConfig = useRuntimeConfig(event).public.auth

  const token = sign({ username: result.data.username }, SECRET, {
    expiresIn: authConfig.provider.token.maxAgeInSeconds,
  })

  return {
    token,
  }
})
