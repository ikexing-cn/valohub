/* eslint-disable no-console */
import { CQ } from 'go-cqwebsocket'
import { getScreenShot } from '../main'
import type { ExecuteCommandGroupOptions } from '.'

export async function dailyStore(options: ExecuteCommandGroupOptions) {
  const alias = options.args?.[0] ?? 'default'

  console.time('image')
  const imageUrl = await getScreenShot(String(options.sender), alias)
  console.timeEnd('image')
  return [CQ.image(imageUrl)]
}
