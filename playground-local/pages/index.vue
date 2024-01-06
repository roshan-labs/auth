<template>
  <div>
    <h1>Home</h1>
    <div>
      <ul>
        <li><nuxt-link to="/no-permission">No permission</nuxt-link></li>
      </ul>
      <div>
        <button @click="logout">Sign Out</button>
      </div>
      <div>
        <button>Add</button>
        <button v-permission="['edit']">Edit</button>
        <button v-permission="['add', 'delete']">Delete</button>
        <button v-permission="['no-permission']">Can't see me</button>
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
