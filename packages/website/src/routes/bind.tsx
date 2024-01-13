/**
 * v0 by Vercel.
 * @see https://v0.dev/t/hqfOoow3NuH
 */
import toast from 'solid-toast'
import { TbLoader } from 'solid-icons/tb'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import { Button } from '~/components/ui/button'
import SignInDialog, {
  type SignInDialogType,
} from '~/components/sign-in/dialog'

import { baseUrl } from '~/utils/request'
import { cn } from '~/lib/utils'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import type { AccountBindResponse } from '@valorant-bot/shared'

async function fetchData(fields: {
  qq: string
  alias: string
  mfaCode: string
  username: string
  password: string
  remember: boolean
  verifyPassword: string
}) {
  const filterEmptyFields = Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
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

export default function SignIn() {
  const [dialogOpen, setDialogOpen] = createSignal(false)
  const [dialogType, setDialogType] = createSignal<SignInDialogType>('initial')

  const [searchParams] = useSearchParams()
  const [loading, setLoading] = createSignal(false)
  const [disabled, setDisabled] = createSignal(false)
  const [fields, setFields] = createStore({
    verifyPassword: '',
    mfaCode: '',
    username: '',
    password: '',
    remember: false,
    riotAllowTerms: false,
  })

  async function handleSubmit() {
    setLoading(true)
    if (!fields.username || !fields.password) {
      return toast.error('请输入用户名和密码')
    } else if (!fields.riotAllowTerms) {
      return toast.error('请同意服务条款')
    }

    const response = await fetchData({
      ...fields,
      qq: atob(searchParams.qq!),
      alias: searchParams.alias ?? 'default',
    })

    if (!response.success) {
      if (response.data) {
        if (
          response.data?.needInit ||
          response.data?.needVerify ||
          response.data?.needMFA
        ) {
          setDialogOpen(true)
          setDialogType(
            response.data.needInit
              ? 'initial'
              : response.data.needMFA
                ? 'mfaCode'
                : 'verify',
          )
          toast(response.message)
          return
        } else if (response.data.needRetry && dialogType() === 'mfaCode') {
          setDialogOpen(true)
        }
      }

      toast.error(response.message)
      return
    }

    setDisabled(true)
    setDialogOpen(false)
    toast.success(response.message)
  }

  async function handleInputEnter(type: SignInDialogType, value: string) {
    setDialogOpen(false)
    if (type === 'initial' || type === 'verify') {
      setFields({ verifyPassword: value })
    } else {
      setFields({ mfaCode: value })
    }
    await handleSubmit().finally(() => setLoading(false))
  }

  onMount(() => {
    try {
      const qq = searchParams?.qq
      if (!qq || !Number.isInteger(Number(atob(qq)))) {
        throw new Error('无效的 qq')
      }
    } catch {
      setDisabled(true)
      toast.error('请在 ValoranBot 处申请链接打开本页面')
    }
  })

  return (
    <div
      class={cn([
        'flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900',
        disabled() && 'pointer-events-none opacity-50',
      ])}
    >
      <SignInDialog
        open={dialogOpen()}
        type={dialogType()}
        onInputEnter={handleInputEnter}
        disabled={loading()}
      />

      <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
          账户绑定
        </h2>
        <form
          class="mt-4 space-y-6"
          prevent
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit().finally(() => setLoading(false))
          }}
        >
          <div class="space-y-2">
            <Label htmlFor="riot-username">Riot 用户名</Label>
            <Input
              name="riot-username"
              id="riot-username"
              required
              type="text"
              autocomplete="username"
              placeholder="请输入用户名"
              onInput={(event) => setFields({ username: event.target.value })}
            />
          </div>
          <div class="space-y-2">
            <Label htmlFor="riot-password">Riot 密码</Label>
            <Input
              name="riot-password"
              id="riot-password"
              required
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
              onInput={(event) => setFields({ password: event.target.value })}
            />
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Checkbox
                name="allow-terms"
                id="allow-terms"
                onChange={(checked) => setFields({ riotAllowTerms: checked })}
              />
              <Label class="text-sm" htmlFor="terms">
                我同意
                <a
                  class="text-blue-500 hover:text-blue-700 "
                  href="#"
                  onClick={() => toast('不知道写啥, 先不写了 :(')}
                >
                  服务条款
                </a>
              </Label>
            </div>
            <div class="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger class="flex items-center space-x-2 bg-white!">
                  <Checkbox
                    name="remember"
                    id="remember"
                    onChange={(checked) => setFields({ remember: checked })}
                  />
                  <Label
                    class="text-sm underline underline-dashed underline-offset-4 cursor-pointer"
                    htmlFor="remember"
                  >
                    保存登录信息
                  </Label>
                </TooltipTrigger>
                <TooltipContent class="text-gray-700">
                  <div class="flex flex-col space-y-2">
                    <span>当你选择保存密码时</span>
                    <span>
                      你的密码将以安全的 RSA
                      方式存储在数据库中。我们并致力保护您的隐私及防止任何泄露。
                    </span>
                    <span>
                      假如未开启二步验证, 当您的 Riot
                      授权过期时将会自动更新,无需重复验证账户。
                    </span>
                    <span>
                      如果你已经开启了二步验证, 则依旧需要进行手动更新。
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Button
            variant="default"
            class="w-full"
            disabled={loading()}
            type="submit"
          >
            <TbLoader
              class={cn([
                'animate-spin w-5 h-5 mr-2',
                loading() ? 'block' : 'hidden',
              ])}
            />
            绑定
          </Button>
        </form>
      </div>
    </div>
  )
}
