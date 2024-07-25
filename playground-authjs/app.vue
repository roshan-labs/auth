<template>
  <div>
    <h1>Authjs provider</h1>
    <div>
      <h3>Status</h3>
      <pre>Status: {{ status }}</pre>
      <pre>Session: {{ data ?? 'no session data' }}</pre>
    </div>
    <div>
      <h3>Actions</h3>
      <button @click="signIn('github')">sign in github</button>
      <br />
      <button @click="signIn(undefined)">sign in</button>
      <br />
      <button @click="signIn('no-provider')">no provider</button>
      <br />
      <button @click="signOut()">sign out</button>
    </div>
    {{ sessionData }}
  </div>
</template>

<script lang="ts" setup>
const { status, data, signIn, signOut } = useAuth()

const { data: sessionData } = useFetch('/api/session')
</script>
