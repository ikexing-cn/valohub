import {
  type VerifiedResponseWith,
  generateHeaders,
  objectOmit,
} from '@valorant-bot/shared'

export const baseUrl =
  process.env.VALORANT_SERVER_URL ?? 'http://localhost:3000'

export type RequestFunction = ReturnType<typeof createRequest>

export type RealResponse<Response extends VerifiedResponseWith> = Omit<
  Response,
  'data'
> & {
  data?: Omit<
    Response['data'],
    | 'needBind'
    | 'needInit'
    | 'needVerify'
    | 'needMFA'
    | 'needRetry'
    | 'needReauth'
  >
  stack?: string
  cause?: string
}

export function createRequest(qq: number) {
  async function request<
    Request extends object,
    Response extends VerifiedResponseWith,
  >(
    url: string,
    options: Omit<RequestInit, 'body'> & { body?: Request } = {},
  ): Promise<RealResponse<Response>> {
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
          message: `检测到你的账户需要绑定或初始化, 请 ${result.data.needInit ? '添加' : '私信'} Bot 好友后使用 "绑定" 指令进行绑定`,
        } as any
      } else if (result.data.needVerify) {
        return {
          success: false,
          message:
            '检测到你的账户需要二次验证所属权, 请私信 Bot 使用 "验证" 指令进行验证',
        } as any
      } else if (result.data.needRetry) {
        return {
          success: false,
          message:
            '重新获取 Riot 授权失败, 请私信 Bot 使用 "验证" 指令进行验证',
        } as any
      } else if (result.data.needMFA) {
        return {
          success: false,
          message:
            '检测到你的账户已开启 Riot 二步验证, 请尝试关闭二步验证或私信 Bot 使用 "验证" 指令进行手动验证',
        } as any
      } else if (result.data.needReauth) {
        return {
          success: false,
          message: `检测到你的账户在 "绑定" 时未选择保存密码，现有的 Riot 授权已过期，请私信 Bot 使用 "验证" 指令进行重新授权`,
        } as any
      }
    }

    if (result?.cause || result?.stack) {
      return {
        success: false,
        message: `出现未知的错误, cause: ${JSON.stringify(result?.cause ?? {})}, stack: ${result?.stack}`,
      } as any
    }

    return result as RealResponse<Response>
  }

  return request
}
