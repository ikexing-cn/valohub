<script lang="ts" setup>
import { useReCaptcha } from 'vue-recaptcha-v3'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  password: z.string({ required_error: '密码不可为空' })
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.,?]).{8,}$/, '密码必须包含大小写字母、数字和特殊符号, 且长度必须大于6')
    .trim(),
})

const state = reactive({
  email: '',
  token: '',
  password: '',
})

const toast = useVueToast()
const recaptcha = useReCaptcha()
const { token } = storeToRefs(useAuthStore())

const { execute, status } = useLazyFetch('/api/auth/login', {
  body: state,
  watch: false,
  method: 'post',
  immediate: false,
  onResponse({ error, response }) {
    if (error || !response.ok) {
      toast.warning(response._data.message)
      return
    }

    const data = response._data as string
    token.value = data

    navigateTo('/')
    toast.success('登录成功')
  },
})

const isFetchPending = computed(() => status.value === 'pending')

async function onSubmit() {
  if (!recaptcha) {
    toast.error('出现未知错误，请重试')
    return
  }

  await recaptcha.recaptchaLoaded()
  const _token = await recaptcha!.executeRecaptcha('login')
  state.token = _token
  await execute()
}

definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="邮箱" name="email">
      <UInput v-model="state.email" :disabled="isFetchPending" placeholder="请输入你的邮箱" icon="i-carbon-email" />
    </UFormGroup>

    <UFormGroup label="密码" name="password">
      <template #hint>
        <UButton variant="link" @click="() => toast.warning('暂不支持')">
          忘记密码
        </UButton>
      </template>
      <UInput v-model="state.password" :disabled="isFetchPending" type="password" placeholder="请输入你的密码" icon="i-carbon-password" />
    </UFormGroup>

    <UButton :loading="isFetchPending" :disabled="isFetchPending" type="submit" block>
      登录
    </UButton>
  </UForm>
</template>
