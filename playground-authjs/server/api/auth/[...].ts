import type { AuthConfig } from '@auth/core/types'
import GitHub from '@auth/core/providers/github'
import Credentials from '@auth/core/providers/credentials'

import { NuxtAuthHandler } from '#auth'

export const options: AuthConfig = {
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

        return null
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
}

export default NuxtAuthHandler(options)
