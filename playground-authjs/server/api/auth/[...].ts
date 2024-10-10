import GitHub from '@auth/core/providers/github'
import Credentials from '@auth/core/providers/credentials'

import { NuxtAuthHandler } from '#auth'

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      authorize: (credentials) => {
        const { email, password } = credentials

        if (email === 'test@email.com' && password === '123') {
          return {
            id: '1',
            email,
          }
        }

        throw new Error('用户名密码错误')
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
})
