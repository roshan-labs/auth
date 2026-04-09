<template>
  <div>
    <div>About Page</div>
    <button @click="signOut">Sign Out</button>
  </div>
</template>

<script lang="ts" setup>
const { signOut } = useAuth()
</script>
