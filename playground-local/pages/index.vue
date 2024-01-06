<template>
  <div>
    <h1>Home</h1>
    <div>
      <div>
        <nuxt-link to="/about">About</nuxt-link>
      </div>
      <div>
        <button @click="logout">Sign Out</button>
      </div>
      <div>
        <button>Add</button>
        <button v-permission="['edit']">Edit</button>
        <button v-permission="['add', 'delete']">Delete</button>
        <button v-permission="['no-permissions']">Can't see me</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { signOut } = useAuth()

const logout = () => {
  signOut()
}
</script>
