import * as puppeteer from 'puppeteer'
import type { Browser, Page } from 'puppeteer'

interface QueueItem {
  url: string
  imageStorePath: string
  status: 'pending' | 'processing'
}

export class ScreenshotQueue {
  private queue: QueueItem[] = []
  private browser: Browser | null = null
  private pages: Map<Page, boolean> = new Map()

  constructor(private pageCacheSize: number) {
    this.initPagePool()
  }

  private async initPagePool() {
    this.browser = await puppeteer.launch({ headless: false })

    for (let i = 0; i < this.pageCacheSize; ++i) {
      const page = await this.browser!.newPage()
      this.pages.set(page, true)
    }
  }

  public async addToQueue(url: string, imageStorePath: string) {
    this.queue.push({ url, imageStorePath, status: 'pending' })
    await this.churnQueue()
  }

  private async churnQueue() {
    const item = this.queue.find((item) => item.status === 'pending')
    const page = Array.from(this.pages).find(([, isIdle]) => isIdle)?.[0]

    if (!item || !page) return

    item.status = 'processing'
    this.pages.set(page, false)
    await page.goto(item.url, { waitUntil: 'networkidle0' })
    await page.screenshot({
      path: item.imageStorePath,
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        height: 370,
        width: 700,
      },
    })

    this.queue = this.queue.filter((i) => i !== item)

    this.pages.set(page, true)

    if (this.queue.length > 0) {
      await this.churnQueue()
    }
  }

  public async beforceExit() {
    for (const page of this.pages.keys()) await page.close()
    if (this.browser) this.browser.close()
  }
}
