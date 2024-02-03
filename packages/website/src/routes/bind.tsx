/**
 * v0 by Vercel.
 * @see https://v0.dev/t/hqfOoow3NuH
 */
import toast from 'solid-toast'
import type { AccountBindResponse, AccountVerifyResponse } from '@valorant-bot/shared'

import { baseUrl } from '~/utils/request'
import Form from '~/components/riot/Form'
import type { SignInDialogType } from '~/components/riot/InputDialog'

async function fetchBind(fields: {
  qq: string
  alias: string
  mfaCode: string
  username: string
  password: string
  remember: boolean
  verifyPassword: string
}) {
  const filterEmptyFields = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value != null && value !== ''),
  )

  const response = await fetch(`${baseUrl}/account/bind`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filterEmptyFields),
  })

  return response.json() as Promise<AccountBindResponse>
}

async function fetchIsBind(qq: string, alias: string) {
  const response = await fetch(`${baseUrl}/account/is-bind`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qq: atob(qq), alias }),
  })

  return response.json() as Promise<AccountVerifyResponse>
}

export default function SignIn() {
  const [searchParams] = useSearchParams()

  const [formControl, setFormControl] = createStore({
    loading: false,
    disabled: false,
    dialogOpen: false,
    dialogType: 'initial' as SignInDialogType,
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
    if (!fields.username || !fields.password)
      return toast.error('请输入用户名和密码')
    else if (!fields.riotAllowTerms)
      return toast.error('请同意服务条款')

    const response = await fetchBind({
      ...fields,
      qq: atob(searchParams.qq!),
      alias: searchParams.alias ?? 'default',
    })

    if (!response.success) {
      if (response.data) {
        if (
          response.data?.needInit
          || response.data?.needVerify
          || response.data?.needMFA
        ) {
          setFormControl({
            dialogOpen: true,
            dialogType: response.data.needInit
              ? 'initial'
              : response.data.needMFA
                ? 'mfaCode'
                : 'verify',
          })
          toast(response.message)
          return
        }
        else if (
          response.data.needRetry
          && formControl.dialogType === 'mfaCode'
        ) {
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

  onMount(async () => {
    try {
      const qq = searchParams?.qq
      if (!qq || !Number.isInteger(Number(atob(qq))))
        throw new Error('无效的 qq')

      setFormControl({ loading: true })
      const isBind = await fetchIsBind(qq, searchParams?.alias || 'default')
        .then((res) => {
          setFormControl({ loading: false })
          return res
        })
      if (isBind.success || isBind?.data?.needBind === true) {
        setFormControl({ disabled: true })
        toast('此 qq 已绑定, 请勿重新绑定')
      }
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
      setFormControl({ disabled: true })
      toast.error('请在 ValoranBot 处申请链接打开本页面')
    }
  })

  return (
    <Form
      fields={fields}
      title="绑定 Riot 账户"
      formControl={formControl}
      setFields={setFields}
      handleSubmit={handleSubmit}
      setFormControl={setFormControl}
      handleInputEnter={handleInputEnter}
    />
  )
}
