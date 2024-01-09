import { sign, verify } from 'jsonwebtoken'

import { SECRET } from './login.post'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ refreshToken: string }>(event)

  if (!body.refreshToken) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized, no refreshToken in payload',
    })
  }

  const decoded = verify(body.refreshToken, SECRET) as { username: string } | undefined

  if (!decoded) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized, refreshToken can`t be verified',
    })
  }

  const data = {
    username: decoded.username,
  }

  const token = sign(data, SECRET, { expiresIn: 5 * 60 })
  const refreshToken = sign(data, SECRET, { expiresIn: 60 * 60 * 24 * 7 })

  return {
    token,
    refreshToken,
  }
})
