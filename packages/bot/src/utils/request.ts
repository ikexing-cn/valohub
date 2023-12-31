import {
  type VerifiedResponseWith,
  generateHeaders,
  objectOmit,
} from '@valorant-bot/shared'
import type { MessageContext } from './message-context'

export const baseUrl =
  process.env.VALORANT_BOT_API_URL ?? 'http://localhost:3000'

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

    if (!result.success) {
      if (result?.data?.needBind) {
        msgCtx?.setGlobal('needBind')
      } else if (result?.data?.needInit) {
        msgCtx?.setGlobal('needInit')
      }
    }

    return result as Omit<Response, 'data'> & {
      data: Omit<Response['data'], 'needBind' | 'needInit'>
    }
  }

  return request
}
