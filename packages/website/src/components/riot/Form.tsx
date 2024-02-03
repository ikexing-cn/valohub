import FormMain from './FormMain'
import FormButtom from './FormBottom'

import { cn } from '~/lib/utils'
import SignInDialog, { type SignInDialogType } from '~/components/riot/InputDialog'

interface FormButtomProps {
  title: string
  formControl: {
    dialogOpen: boolean
    dialogType: SignInDialogType
    loading: boolean
    disabled: boolean
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
  setFormControl: (fields: Record<string, unknown>) => void
  handleSubmit: () => Promise<string | undefined>
  handleInputEnter: (type: SignInDialogType, value: string) => void

  buttonTitle?: string
}

export default function Form(props: FormButtomProps) {
  return (
    <div
      class={cn([
        'flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900',
        (props.formControl.disabled || props.formControl.loading) && 'pointer-events-none opacity-50',
      ])}
    >
      <SignInDialog
        open={props.formControl.dialogOpen}
        type={props.formControl.dialogType}
        onInputEnter={props.handleInputEnter}
        disabled={props.formControl.loading}
      />

      <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
          {props.title}
        </h2>
        <form
          class="mt-4 space-y-6"
          prevent
          onSubmit={(event) => {
            event.preventDefault()
            props
              .handleSubmit()
              .finally(() => props.setFormControl({ loading: false }))
          }}
        >
          <FormMain
            fields={props.fields}
            formControl={props.formControl}
            setFields={props.setFields}
          />
          <FormButtom
            fetchControl={props.formControl}
            setFields={props.setFields}
            buttonTitle={props.buttonTitle ?? '绑定'}
          />
        </form>
      </div>
    </div>
  )
}
