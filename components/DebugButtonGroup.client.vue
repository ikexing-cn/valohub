<script lang="ts" setup>
const colorMode = useColorMode()
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})

const isDev = computed(() => import.meta.env.DEV)
</script>

<template>
  <ClientOnly v-if="isDev">
    <div class="absolute bottom-8 right-8 md:bottom-16 md:right-16">
      <UButton
        :icon="isDark ? 'i-carbon-moon' : 'i-carbon-sun'"
        color="gray"
        variant="ghost"
        aria-label="Theme"
        class="hover:bg-primary hover:text-white hover:text-opacity-85 dark:hover:text-primary transition-colors duration-100"
        @click="isDark = !isDark"
      />
    </div>
    <template #fallback>
      <div class="w-8 h-8" />
    </template>
  </ClientOnly>
</template>
