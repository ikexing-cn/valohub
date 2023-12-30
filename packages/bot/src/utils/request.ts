import {
  type VerifiedResponseWith,
  generateHeaders,
  objectOmit,
} from '@valorant-bot/shared'

export const baseUrl = 'http://localhost:3000'

export async function request<T extends VerifiedResponseWith>(
  url: string,
  qq: number,
  options: Omit<RequestInit, 'body'> & {
    body?: Record<string, any>
  } = {},
) {
  const response = await fetch(`${baseUrl}${url}`, {
    ...objectOmit(options, ['headers', 'body']),
    method: 'POST',
    body: JSON.stringify({
      ...options.body,
      qq,
    }),
    headers: generateHeaders(options.headers),
  })

  const json = (await response.json()) as T

  return json
}
