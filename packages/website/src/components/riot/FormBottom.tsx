import toast from 'solid-toast'

import { TbLoader } from 'solid-icons/tb'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

interface FormButtomProps {
  fetchControl: {
    loading: boolean
  }
  setFields: (fields: Record<string, unknown>) => void
  buttonTitle: string
}

export default function FormButtom(props: FormButtomProps) {
  return (
    <>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Checkbox
            name="allow-terms"
            id="allow-terms"
            onChange={checked => props.setFields({ riotAllowTerms: checked })}
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
                id="remember"
                name="remember"
                onChange={checked => props.setFields({ remember: checked })}
              />
              <Label
                htmlFor="remember"
                class="text-sm underline underline-dashed underline-offset-4 cursor-pointer"
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
                <span>如果你已经开启了二步验证, 则依旧需要进行手动更新。</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Button
        variant="default"
        class="w-full"
        disabled={props.fetchControl.loading}
        type="submit"
      >
        <TbLoader
          class={cn([
            'animate-spin w-5 h-5 mr-2',
            props.fetchControl.loading ? 'block' : 'hidden',
          ])}
        />
        {props.buttonTitle}
      </Button>
    </>
  )
}
