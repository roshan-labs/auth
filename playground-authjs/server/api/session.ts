import { options } from './auth/[...]'
import { getServerSession, getServerToken } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const token = await getServerToken(event, options)

  return {
    session,
    token,
  }
})
