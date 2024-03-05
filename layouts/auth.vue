<script lang="ts" setup>
const route = useRoute()
const toast = useVueToast()
const authStore = useAuthStore()
const isLogin = computed(() => route.path === '/auth/login')

if (authStore.token) {
  navigateTo('/')
  toast.warning('你已登录，无需重复登录')
}
</script>

<template>
  <div class="relative mx-auto flex items-center max-w-sm h-full">
    <UCard class="w-full rounded-md p-2">
      <template #header>
        <div class="text-center">
          <h1 class="text-4xl font-mono font-medium">
            Valohub
          </h1>
          <h2 class="text-sm mt-2">
            {{ isLogin ? '还没账号？' : '已有账号？' }}
            <ULink class="text-primary" :to="isLogin ? '/auth/register' : '/auth/login'">
              点此{{ isLogin ? '注册' : '登录' }}
            </ULink>
          </h2>
        </div>
      </template>

      <slot />

      <template #footer>
        <div class="text-sm text-center">
          <span>{{ isLogin ? '登录' : '注册' }}即代表你将同意我们的</span>
          <ULink class="text-primary">
            服务条款
          </ULink>
        </div>
      </template>
    </UCard>

    <DebugButtonGroup />
  </div>
</template>
