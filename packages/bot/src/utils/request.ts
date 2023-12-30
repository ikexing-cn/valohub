import {
  type VerifiedResponseWith,
  generateHeaders,
  objectOmit,
} from '@valorant-bot/shared'

export const baseUrl =
  process.env.VALORANT_BOT_API_URL ?? 'http://localhost:3000'

export type RequestFunction = ReturnType<typeof createRequest>
export function createRequest(qq: number, sendMsg?: (msg: string) => void) {
  async function request<
    Request extends object,
    Response extends VerifiedResponseWith,
  >(url: string, options: Omit<RequestInit, 'body'> & { body?: Request } = {}) {
    const response = await fetch(`${baseUrl}${url}`, {
      ...objectOmit(options, ['headers', 'body']),
      method: 'POST',
      headers: generateHeaders(options.headers),
      body: JSON.stringify({
        qq,
        ...options.body,
      }),
    })

    const result = (await response.json()) as Response

    if (!result.success) {
      if (result.data?.needBind) {
        sendMsg?.(result.message)
      } else if (result.data?.needInit) {
        sendMsg?.(result.message)
      }
    }

    return result as Omit<Response, 'data'> & {
      data: Omit<Response['data'], 'needBind' | 'needInit'>
    }
  }

  return request
}
