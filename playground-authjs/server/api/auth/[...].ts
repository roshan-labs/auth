import GitHub from '@auth/core/providers/github'
import type { AuthConfig } from '@auth/core/types'

import { NuxtAuthHandler } from '#auth'

export const options: AuthConfig = {
  secret: 'NtoBpkbWs4uTqsEvBJ/UyvWGFYAXQ9/tdNrmQCf7NIQ=',
  providers: [
    GitHub({
      clientId: '10b3f386a001067199c0',
      clientSecret: '85bca5873bed7f8744d88917e639518a3cbc3b90',
    }),
  ],
}

export default NuxtAuthHandler(options)
