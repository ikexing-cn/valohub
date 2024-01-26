import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface FormMainProps {
  formControl: {
    inputDisabled?: {
      username: boolean
      password: boolean
    }
  }
  fields: {
    username: string
    password: string
  }
  setFields: (fields: Record<string, unknown>) => void
}

export default function FormMain(props: FormMainProps) {
  return (
    <>
      <div class="space-y-2">
        <Label htmlFor="riot-username">Riot 用户名</Label>
        <Input
          disabled={props.formControl.inputDisabled?.username}
          name="riot-username"
          id="riot-username"
          required
          type="text"
          autocomplete="username"
          placeholder="请输入用户名"
          value={props.fields.username}
          onInput={(event) => props.setFields({ username: event.target.value })}
        />
      </div>
      <div class="space-y-2">
        <Label htmlFor="riot-password">Riot 密码</Label>
        <Input
          disabled={props.formControl.inputDisabled?.password}
          name="riot-password"
          id="riot-password"
          required
          type="password"
          autocomplete="current-password"
          placeholder={props.fields.password ? '请输入密码' : '*'.repeat(16)}
          onInput={(event) => props.setFields({ password: event.target.value })}
        />
      </div>
    </>
  )
}
