import GitHub from '@auth/core/providers/github'
import type { AuthConfig } from '@auth/core/types'

import { NuxtAuthHandler } from '#auth'

export const options: AuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
}

export default NuxtAuthHandler(options)
