import { createRequest } from '../utils/request'

async function fetchData(qq: number, alias: string) {
  const request = createRequest(qq)
  const response = await request('/account/unbind', { body: { alias } })
  return response.message
}

export function unbindCommand(qq: number, alias: string = 'default') {
  return fetchData(qq, alias)
}
