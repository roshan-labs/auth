import { z } from 'zod'
import { sign } from 'jsonwebtoken'

export const SECRET = 'roshan-labs'

export default defineEventHandler(async (event) => {
  const result = z
    .object({ username: z.string().min(1), password: z.literal('123') })
    .safeParse(await readBody(event))

  if (!result.success) {
    throw createError({ status: 403, statusMessage: 'username or password wrong' })
  }

  const token = sign({ username: result.data.username }, SECRET, { expiresIn: 60 * 5 })

  return {
    token,
  }
})
