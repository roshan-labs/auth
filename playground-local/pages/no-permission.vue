<template>
  <div>
    <h1>No permission</h1>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  auth: {
    permission: ['page:no-permission'],
  },
})
</script>
