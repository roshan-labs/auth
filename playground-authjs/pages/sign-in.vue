<template>
  <div>
    <h1>Sign In</h1>
    <div>
      <input v-model="model.email" type="text" />
    </div>
    <div>
      <input v-model="model.password" type="password" />
    </div>
    <button @click="login">Login</button>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})

const { signIn } = useAuth()

const model = ref({
  email: 'test@email.com',
  password: '123',
})

const login = async () => {
  const result = await signIn('credentials', { ...model.value, redirect: true })

  if (result) {
    console.log(result.error)
  }
}
</script>
