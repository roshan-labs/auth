export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['../src/module'],
  auth: {
    baseURL: 'http://localhost:3000/api/auth',
    provider: {
      type: 'authjs',
    },
    globalAppMiddleware: true,
  },
})
