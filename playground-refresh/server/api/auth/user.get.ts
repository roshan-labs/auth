import { verify } from 'jsonwebtoken'

import { SECRET } from './login.post'

const TOKEN_TYPE = 'Bearer'

export default defineEventHandler((event) => {
  const authorization = getRequestHeader(event, 'Authorization')

  if (typeof authorization === 'undefined') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Need to pass valid Bearer-authorization header to access this endpoint',
    })
  }

  const [, token] = authorization.split(`${TOKEN_TYPE} `)

  try {
    const user = verify(token, SECRET)

    return {
      user,
      permissions: ['page:home', 'add', 'edit'],
    }
  } catch (error) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You must be logged in to use this endpoint',
    })
  }
})
