import toast from 'solid-toast'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

export type SignInDialogType = 'initial' | 'verify' | 'mfaCode'

interface SignInDialogProps {
  open: boolean
  disabled: boolean
  type: SignInDialogType
  onInputEnter: (type: SignInDialogType, value: string) => void
}
export default function SignInDialog(props: SignInDialogProps) {
  const [text, setText] = createSignal('')
  const [rePassword, setRePassword] = createSignal('')

  const typeName = props.type === 'verify' ? '初始密码' : '二步验证码'

  function handleConfirm() {
    if (!text()) {
      toast.error(`请输入你的${typeName}`)
      return
    }
    if (props.type === 'verify' && text() !== rePassword()) {
      toast.error('两次输入的密码不一致, 请确保输入的密码一致')
      return
    }
    props.onInputEnter(props.type, text())
  }

  return (
    <Dialog open={props.open}>
      {/* <DialogTrigger as={Button} ref={props.ref} hidden /> */}
      <DialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            请{props.type === 'verify' ? '验证' : '输入'}你的{typeName}
          </DialogTitle>
          <DialogDescription>
            <Input
              class="my"
              placeholder={`请输入你的${typeName}`}
              onInput={(event) => setText(event.target.value)}
            />
            {props.type === 'verify' && (
              <Input
                class="my"
                placeholder={`请重复输入你的${typeName}`}
                onInput={(event) => setRePassword(event.target.value)}
              />
            )}
          </DialogDescription>
          <DialogFooter>
            <Button onClick={handleConfirm} disabled={props.disabled}>
              确认
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
