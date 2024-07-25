export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['../src/module'],

  auth: {
    baseURL: '/api/auth',
    provider: {
      type: 'authjs',
    },
    globalAppMiddleware: {
      allow404WithoutAuth: false,
      isEnabled: true,
    },
  },

  compatibilityDate: '2024-07-25',
})
