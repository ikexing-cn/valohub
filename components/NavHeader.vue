<script lang="ts" setup>
import { md5 } from 'js-md5'
import type { DropdownItem } from '#ui/types'

const authStore = useAuthStore()
const colorMode = useColorMode()
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})

const toast = useVueToast()
const { execute } = useLazyFetch('/api/auth/details', {
  method: 'post',
  watch: false,
  immediate: false,
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  },
  onResponse({ error, response }) {
    if (error || !response.ok) {
      toast.warning(response._data.message)
      return
    }

    authStore.details = response._data
  },
})

authStore.token && execute()
const isLogin = computed(() => !!authStore.details?.email)

const dropdownItems = computed<DropdownItem[][]>(() => {
  if (isLogin.value) {
    const items: DropdownItem[] = []
    if (!authStore.details?.isValid) {
      items.push({
        label: '验证邮箱',
        icon: 'i-carbon-mail-all',
      })
    }
    items.push({
      label: '个人中心',
      icon: 'i-carbon-cube',
    })

    return [
      items,
      [{
        label: '退出登录',
        icon: 'i-carbon-logout',
        click() {
          authStore.token = ''
          authStore.details = {} as any
        },
      }],
    ]
  }
  else {
    return [
      [{
        label: '登录',
        icon: 'i-carbon-login',
        click() {
          navigateTo('/auth/login')
        },
      }],
    ]
  }
})
</script>

<template>
  <header class="w-full px-2 lg-px-0">
    <div class="container mx-auto py-2">
      <div class="flex items-center justify-between">
        <h1 class="font-sans text-3xl font-medium tracking-wide">
          Valo<span class="text-primary">hub</span>
        </h1>

        <!-- <div>
          {{ authStore.email }}
        </div> -->

        <div>
          <UButton size="xl" color="gray" variant="ghost" square :icon="isDark ? 'i-carbon-moon' : 'i-carbon-sun'" @click="isDark = !isDark" />
          <UButton size="xl" color="gray" variant="ghost" square icon="i-carbon-logo-github" to="https://github.com/ikexing-cn/valohub" target="_blank" />
          <UDropdown :items="dropdownItems">
            <template #item="{ item }">
              <div class="flex items-center justify-between mx-4 w-full">
                <span class="truncate">{{ item.label }}</span>
                <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto" />
              </div>
            </template>

            <UButton size="lg" color="gray" variant="ghost" square>
              <UAvatar v-if="isLogin" :alt="authStore.details!.username" :src="`http://www.gravatar.com/avatar/${md5(authStore.details!.email)}`" size="xs" />
              <UIcon v-else name="i-carbon-user-avatar" class="text-2xl" />
            </UButton>
          </UDropdown>
        </div>
      </div>
    </div>
    <UDivider />
  </header>
</template>
