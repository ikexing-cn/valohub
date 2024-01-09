/* eslint-disable no-console */
import { CQ } from 'go-cqwebsocket'
import { getScreenShot } from '../main'

export async function dailyStore(sender: number) {
  console.time('image')
  const imageUrl = await getScreenShot(String(sender))
  console.timeEnd('image')
  return [CQ.image(imageUrl)]
}
