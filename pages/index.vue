<script lang="ts" setup>
const authStore = useAuthStore()
</script>

<template>
  <div>
    page
    <br>
    <pre>
      token: {{ authStore.token }}
    </pre>
  </div>
</template>
