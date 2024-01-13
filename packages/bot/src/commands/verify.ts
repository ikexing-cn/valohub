import { createRequest } from '../utils/request'

async function fetchData(qq: number, password: string, alias: string) {
  const request = createRequest(qq)
  const response = await request('/account/verify', {
    body: { verifyPassword: password, alias },
  })
  return response.message
}

export function verifyCommand(
  qq: number,
  password: string,
  alias: string = 'default',
) {
  return fetchData(qq, password, alias)
}
