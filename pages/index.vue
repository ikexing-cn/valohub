<script lang="ts" setup>
const authStore = useAuthStore()
</script>

<template>
  <div>
    page
    <pre>{{ JSON.stringify(authStore.details, null, 2).trim() }}</pre>
  </div>
</template>
