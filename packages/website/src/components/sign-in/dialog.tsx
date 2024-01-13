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

  return (
    <Dialog open={props.open}>
      {/* <DialogTrigger as={Button} ref={props.ref} hidden /> */}
      <DialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            请{props.type === 'verify' ? '验证' : '输入'}你的
            {props.type !== 'mfaCode' ? '初始密码' : '二步验证码'}
          </DialogTitle>
          <DialogDescription>
            <Input
              class="my"
              onInput={(event) => setText(event.target.value)}
            />
          </DialogDescription>
          <DialogFooter>
            <Button
              onClick={() => props.onInputEnter(props.type, text())}
              disabled={props.disabled}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
