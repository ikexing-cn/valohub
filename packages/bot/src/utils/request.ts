import {
  type VerifiedResponseWith,
  generateHeaders,
  objectOmit,
} from '@valorant-bot/shared'

export const baseUrl =
  process.env.VALORANT_SERVER_URL ?? 'http://localhost:3000'

export type RequestFunction = ReturnType<typeof createRequest>
export function createRequest(qq: number) {
  async function request<
    Request extends object,
    Response extends VerifiedResponseWith,
  >(url: string, options: Omit<RequestInit, 'body'> & { body?: Request } = {}) {
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

    if (!result.success && result?.data) {
      if (result.data.needBind || result.data.needInit) {
        return {
          success: false,
          message:
            '你的账户需要绑定或初始化, 请添加 Bot 好友后使用 "绑定" 指令进行绑定',
        }
      } else if (result.data.needVerify) {
        return {
          success: false,
          message:
            '你的账户需要二次验证所属权, 请私信 Bot 使用 "验证" 指令进行验证',
        }
      }
    }

    return result as Omit<Response, 'data'> & {
      data: Omit<Response['data'], 'needBind' | 'needInit' | 'needVerify'>
    }
  }

  return request
}
