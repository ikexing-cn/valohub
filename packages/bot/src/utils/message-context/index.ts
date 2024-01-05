import { type RequestFunction, createRequest } from '../request'
import type { Commands } from '../../command'

type GlobalType = 'verify' | 'unknow'

export class MessageContext<T extends Commands> {
  private _stepData: string[] = ['']

  protected step: number = 0
  protected request: RequestFunction

  public isGlobalState: boolean = false
  public globalData: Record<'verifyPassword', string> = {} as any
  protected globalCommand: GlobalType = 'unknow'

  constructor(
    protected qq: number,
    public type: T,
  ) {
    this.request = createRequest(qq, this)
  }

  protected forward(data: string) {
    this.step++
    this._stepData.push(data)
    return this
  }

  protected back() {
    this.step--
    return this
  }

  protected get stepData() {
    return this._stepData.slice(0, this.step + 1).filter((step) => step != null)
  }

  public setGlobal(globalCommand: GlobalType) {
    this.isGlobalState = true
    this.globalCommand = globalCommand
  }

  public setGlobalData(data: Record<string, string>) {
    this.globalData = data
  }

  protected quitGlobalState() {
    this.isGlobalState = false
    this.globalCommand = 'unknow'
    this.globalData = {} as any
  }

  protected clear() {
    this.step = -1
    this._stepData = []
  }

  public async execute(
    message?: string,
    // eslint-disable-next-line unused-imports/no-unused-vars
    sendMsg?: (msg: string) => void,
    //@ts-expect-error: sub class impl
  ): Promise<string> | string {
    if (this.isGlobalState) {
      this.setGlobalData({ verifyPassword: message! })
      const response = await this.request('/account/auth', {
        body: {
          verifyPassword: message!,
        },
      })

      if (response.success) {
        this.quitGlobalState()
      }
      sendMsg?.(response.message)
    }
  }
}
