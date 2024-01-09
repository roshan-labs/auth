export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['../src/module'],
  build: {
    transpile: ['jsonwebtoken'],
  },
  auth: {
    baseURL: '/api/auth',
    provider: {
      type: 'refresh',
      endpoints: {
        refresh: { path: '/refresh', method: 'post' },
        getSession: { path: '/user', method: 'get' },
      },
      pages: {
        login: '/',
      },
      token: {
        signInResponseTokenPointer: '/token',
        // 5 minutes
        maxAgeInSeconds: 60 * 5,
      },
      refreshToken: {
        signInResponseRefreshTokenPointer: '/refreshToken',
        // 7 days
        maxAgeInSeconds: 60 * 60 * 24 * 7,
      },
      refreshOnlyToken: false,
    },
    globalAppMiddleware: {
      isEnabled: true,
    },
  },
})
