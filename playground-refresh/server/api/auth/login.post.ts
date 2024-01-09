import { z } from 'zod'
import { sign } from 'jsonwebtoken'

export const SECRET = 'refresh-provider'

export default defineEventHandler(async (event) => {
  // 1. 校验传参
  const result = await readValidatedBody(
    event,
    z.object({ username: z.string().min(1), password: z.literal('123') }).safeParse
  )

  // 2. 参数错误时响应
  if (!result.success) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Username or password wrong.',
    })
  }

  // 3. 生成 token 与 refreshToken
  const data = {
    username: result.data.username,
  }

  const token = sign(data, SECRET, { expiresIn: 60 * 5 })
  const refreshToken = sign(data, SECRET, {
    expiresIn: 60 * 60 * 24 * 7,
  })

  return {
    token,
    refreshToken,
  }
})
