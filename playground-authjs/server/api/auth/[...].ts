import GitHub from '@auth/core/providers/github'
import type { AuthConfig } from '@auth/core/types'

import { NuxtAuthHandler } from '#auth'

export const options: AuthConfig = {
  secret: 'NtoBpkbWs4uTqsEvBJ/UyvWGFYAXQ9/tdNrmQCf7NIQ=',
  providers: [
    GitHub({
      clientId: 'Ov23liQRrLjGUGn1YrGg',
      clientSecret: '518ce6409b3ca4defe6b6b356939d2d462f23b41',
    }),
  ],
}

export default NuxtAuthHandler(options)
