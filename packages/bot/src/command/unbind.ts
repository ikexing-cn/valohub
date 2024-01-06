import { createRequest } from '../utils/request'
import type { AliasOnlyRequest } from '@valorant-bot/shared'

export async function unbind(sender: number) {
  const request = createRequest(sender)
  const response = await request<AliasOnlyRequest, any>('/account/unbind')
  return `${response.message}`
}
