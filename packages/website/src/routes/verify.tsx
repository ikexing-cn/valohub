import toast from 'solid-toast'
import type { AccountVerifyResponse } from '@valorant-bot/shared'

import Form from '~/components/riot/Form'
import { baseUrl } from '~/utils/request'
import type { SignInDialogType } from '~/components/riot/InputDialog'

async function fetchAuth(qq: string, alias: string) {
  const response = await fetch(`${baseUrl}/account/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qq: atob(qq), alias }),
  })

  return response.json() as Promise<AccountVerifyResponse>
}

async function fetchVerify(fields: {
  qq: string
  alias: string
  mfaCode: string
  username: string
  password: string
  verifyPassword: string
}) {
  const filterEmptyFields = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value != null && value !== ''),
  )
  const response = await fetch(`${baseUrl}/account/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filterEmptyFields),
  })

  return response.json() as Promise<AccountVerifyResponse>
}

export default function Verify() {
  const [searchParams] = useSearchParams()
  const [formControl, setFormControl] = createStore({
    loading: false,
    disabled: false,
    dialogOpen: false,
    dialogType: 'initial' as SignInDialogType,
    inputDisabled: {
      username: false,
      password: false,
    },
  })

  const [fields, setFields] = createStore({
    verifyPassword: '',
    mfaCode: '',
    username: '',
    password: '',
    remember: false,
    riotAllowTerms: false,
  })

  async function handleSubmit() {
    setFormControl({ loading: true })
    if (!fields.username)
      return toast.error('请输入用户名')
    else if (!fields.riotAllowTerms)
      return toast.error('请同意服务条款')

    const response = await fetchVerify({
      ...fields,
      qq: atob(searchParams.qq!),
      alias: searchParams.alias ?? 'default',
    })

    if (!response.success) {
      if (response.data) {
        if (response.data?.needMFA) {
          setFormControl({
            dialogOpen: true,
            dialogType: 'mfaCode',
          })
          toast(response.message)
          return
        }
        else if (response.data.needRetry) {
          setFormControl({ dialogOpen: true })
        }
      }

      toast.error(response.message)
      return
    }

    setFormControl({ disabled: true, dialogOpen: false })
    toast.success(response.message)
  }

  async function handleInputEnter(type: SignInDialogType, value: string) {
    setFormControl({ dialogOpen: false })
    if (type === 'initial' || type === 'verify')
      setFields({ verifyPassword: value })
    else
      setFields({ mfaCode: value })

    await handleSubmit().finally(() => setFormControl({ loading: false }))
  }

  async function beforeReauth(qq: string) {
    setFormControl({ loading: true })
    const authResponse = await fetchAuth(
      qq,
      searchParams?.alias || 'default',
    ).finally(() => setFormControl({ loading: false }))

    if (authResponse.success) {
      setFormControl({ disabled: true })
      toast('此 qq 暂无需验证，请勿使用此页面')
      return
    }

    setFields({
      username: authResponse.data.riotUsername ?? '',
      password: '*'.repeat(16),
    })
    if (authResponse.data.needVerify) {
      // todo
      setFields({ riotAllowTerms: true })
    }
    else if (authResponse.data.needRetry) {
      setFields({ riotAllowTerms: true, remember: true })
      setFormControl({ inputDisabled: { username: true, password: false } })
    }
    else if (authResponse.data.needMFA) {
      setFields({
        riotAllowTerms: true,
        remember: true,
        password: '*'.repeat(16),
      })
      setFormControl({ dialogOpen: true, dialogType: 'mfaCode' })
      setFormControl({ inputDisabled: { username: true, password: true } })
    }
  }

  onMount(async () => {
    try {
      const qq = searchParams?.qq
      if (!qq || !Number.isInteger(Number(atob(qq))))
        throw new Error('无效的 qq')

      await beforeReauth(qq)
    }
    catch {
      setFormControl({ disabled: true })
      toast.error('请在 ValoranBot 处申请链接打开本页面')
    }
  })

  return (
    <Form
      title="验证 Riot 账户"
      fields={fields}
      formControl={formControl}
      setFields={setFields}
      handleSubmit={handleSubmit}
      setFormControl={setFormControl}
      handleInputEnter={handleInputEnter}
      buttonTitle="验证"
    />
  )
}
