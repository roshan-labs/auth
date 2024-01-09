<template>
  <div>
    <h1>Refresh provider</h1>
    <div>
      <h3>Status</h3>
      <pre>Status: {{ status }}</pre>
      <pre>Data: {{ data }}</pre>
      <pre>Last refresh at: {{ lastRefreshedAt?.toUTCString() ?? 'No date' }}</pre>
      <pre>Token: {{ token ?? 'No token' }}</pre>
      <pre>Refresh token: {{ refreshToken ?? 'No refresh token' }}</pre>

      <template v-if="status === 'unauthenticated'">
        <h3>Login</h3>
        <form @submit.prevent="login">
          <input v-model="loginModel.username" type="text" placeholder="Username" />
          <input v-model="loginModel.password" type="password" placeholder="Password" />
          <button type="submit">login</button>
        </form>
      </template>

      <h3>Actions</h3>
      <button @click="signOut()">Sign out</button>
      <br />
      <button @click="doRefreshToken()">Refresh token</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { status, data, lastRefreshedAt, token, refreshToken, signIn, signOut, refresh } = useAuth()

const loginModel = ref({
  username: 'admin',
  password: '123',
})

const login = () => {
  signIn(loginModel.value)
}

const doRefreshToken = () => {
  refresh({ refreshToken: refreshToken.value })
}
</script>
