import jwt from 'jsonwebtoken'

import { SECRET } from './login.post'

export default defineEventHandler((event) => {
  const authorization = getRequestHeader(event, 'Authorization')

  if (typeof authorization === 'undefined') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Need to pass valid Bearer-authorization header to access this endpoint',
    })
  }

  const [, token] = authorization.split('Bearer ')

  try {
    const user = jwt.verify(token!, SECRET)

    return {
      user,
      permission: ['page:home', 'page:about', 'add', 'edit'],
    }
  } catch (error) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You must be logged in to use this endpoint',
    })
  }
})
