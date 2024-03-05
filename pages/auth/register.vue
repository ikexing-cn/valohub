<script lang="ts" setup>
import { z } from 'zod'
import { useReCaptcha } from 'vue-recaptcha-v3'

const passwordParser = z.string({ required_error: '密码不可为空' })
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.,?]).{8,}$/, '密码必须包含大小写字母、数字和特殊符号, 且长度必须大于6')
  .trim()

const schema = z.object({
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  username: z.string({ required_error: '用户名不可为空' }).min(2, { message: '用户名长度不能小于2' }),
  password: passwordParser,
  rePassword: passwordParser,
}).refine(data => data.password === data.rePassword, { message: '两次密码不一致', path: ['rePassword'] })

const state = reactive({
  token: '',
  email: '',
  username: '',
  password: '',
  rePassword: '',
})

const toast = useVueToast()
const recaptcha = useReCaptcha()
const { token } = storeToRefs(useAuthStore())

const { execute, status } = useLazyFetch('/api/auth/register', {
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
  const _token = await recaptcha!.executeRecaptcha('register')
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

    <UFormGroup label="用户名" name="username">
      <UInput v-model="state.username" :disabled="isFetchPending" placeholder="请输入你的用户名" icon="i-carbon-user" />
    </UFormGroup>

    <UFormGroup label="密码" name="password">
      <UInput v-model="state.password" :disabled="isFetchPending" type="password" placeholder="请输入你的密码" icon="i-carbon-password" />
    </UFormGroup>

    <UFormGroup label="重复密码" name="rePassword">
      <template #hint>
        <UButton variant="link" class="text-primary font-medium" to="/auth/login">
          已有账号？
        </UButton>
      </template>
      <UInput v-model="state.rePassword" :disabled="isFetchPending" type="password" placeholder="请重复输入你的密码" icon="i-carbon-password" />
    </UFormGroup>

    <UButton
      :loading="isFetchPending" :disabled="isFetchPending" type="submit" block class="g-recaptcha" data-sitekey="6LdgbIopAAAAABpGIO_vheaw6AMNhcflLl6EjJe0"
    >
      登录
    </UButton>
  </UForm>
</template>
