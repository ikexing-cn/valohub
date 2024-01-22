export function verifyCommand(qq: number, alias: string = 'default') {
  return `请打开以下链接进行验证：${
    process.env.VALORANT_WEBSITE_URL
  }/verify?qq=${btoa(qq.toString())}&alias=${alias}`
}
