<template>
  <div>
    <h1>Home</h1>
    <div>
      <h3>Pages</h3>
      <ul>
        <li><nuxt-link to="/no-permission">No permission</nuxt-link></li>
      </ul>
      <h3>Permissions</h3>
      <div>
        <button v-permission="'add'">Add</button>
        <button v-permission="'edit'">Edit</button>
        <button v-permission="'delete'">Delete</button>
        <button v-permission="['no-permission']">Can't see me</button>
      </div>
      <h3>Sign out</h3>
      <button @click="logout">Sign Out</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { signOut } = useAuth()

const logout = () => {
  signOut()
}
</script>
