export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  build: {
    transpile: ['jsonwebtoken'],
  },
  auth: {
    baseURL: '/api/auth',
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        getSession: { path: '/user', method: 'get' },
      },
      pages: {
        login: '/login',
      },
      permission: {
        isEnabled: true,
        permissionPointer: '/permission',
      },
      token: {
        // maxAgeInSeconds: 60,
      },
    },
    globalAppMiddleware: true,
  },
})
