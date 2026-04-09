export default defineNuxtConfig({
  modules: ['../src/module'],

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
      permissionData: {
        enabled: true,
        getSessionResponsePermissionPointer: '/permission',
      },
    },
    globalAppMiddleware: true,
  },

  compatibilityDate: '2024-07-25',
})
