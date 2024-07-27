import GitHub from '@auth/core/providers/github'
import type { AuthConfig } from '@auth/core/types'

import { NuxtAuthHandler } from '#auth'

export const options: AuthConfig = {
  secret: '',
  providers: [
    GitHub({
      clientId: '',
      clientSecret: '',
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
}

export default NuxtAuthHandler(options)
