<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div>
        <input v-model="username" type="text" placeholder="Username" />
      </div>
      <div>
        <input v-model="password" type="password" placeholder="Password" />
      </div>
      <button type="submit">login</button>
    </form>
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

const username = ref('')
const password = ref('')

const login = () => {
  signIn({ username: username.value, password: password.value })
}
</script>
