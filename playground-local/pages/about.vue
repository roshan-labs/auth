<template>
  <div>
    <h1>About</h1>
    <div>
      <button @click="() => signOut({ redirect: true })">Sign out</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  auth: {
    permission: 'page',
  },
})
const { signOut } = useAuth()
</script>
