import {
  type VerifiedResponseWith,
  generateHeaders,
  objectOmit,
} from '@valorant-bot/shared'
import { createMsgCtx } from './message-context/manager'
import type { MessageContext } from './message-context'

export const baseUrl =
  process.env.VALORANT_SERVER_URL ?? 'http://localhost:3000'

export type RequestFunction = ReturnType<typeof createRequest>
export function createRequest(qq: number, msgCtx?: MessageContext<any>) {
  async function request<
    Request extends object,
    Response extends VerifiedResponseWith,
  >(url: string, options: Omit<RequestInit, 'body'> & { body?: Request } = {}) {
    const body = {
      qq: String(qq),
      ...options.body,
    }

    if (msgCtx?.isGlobalState) {
      Object.entries(msgCtx.globalData).forEach(([key, value]) => {
        //@ts-expect-error
        body[key] = value
      })
    }

    const response = await fetch(`${baseUrl}${url}`, {
      ...objectOmit(options, ['headers', 'body']),
      method: 'POST',
      headers: generateHeaders(options.headers),
      body: JSON.stringify({
        qq: String(qq),
        ...options.body,
      }),
    })

    const result = (await response.json()) as Response

    if (
      !result.success &&
      (result?.data?.needBind ||
        result?.data?.needInit ||
        result?.data?.needVerify)
    ) {
      if (!msgCtx) {
        msgCtx = createMsgCtx(qq, 'error')
      }

      return {
        ...result,
        message: `${result.message} [注意隐私信息私聊 Bot]`,
      }
    }

    return result as Omit<Response, 'data'> & {
      data: Omit<Response['data'], 'needBind' | 'needInit' | 'needVerify'>
    }
  }

  return request
}
