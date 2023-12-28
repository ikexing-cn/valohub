interface AuthMultifactorResponse {
  type: 'multifactor'
  country: string
  multifactor: {
    email: string
    type: 'email'
    multiFactorCodeLength: number
  }
}

export interface AuthResponse {
  type: 'response'
  response: {
    parameters: {
      uri: string
    }
  }
}

export interface AuthFailureResponse {
  type: 'auth'
  error: string
  country: string
}

export type AuthResponseOrFailure = AuthResponse | AuthFailureResponse
export type AuthLoginResponse = AuthMultifactorResponse | AuthResponseOrFailure

export interface RegionResponse {
  token: string
  affinities: {
    pbe: string
    live: string
  }
}

export interface EntitlementTokenResponse {
  entitlements_token: string
}

// 没有标记的 field 表示我也不知道什么意思)
export interface PlayerInfoResponse {
  // 用户账号所属区域
  country: string
  // userid
  sub: string
  // 邮箱是否已验证
  email_verified: boolean
  country_at: number
  // 用户的密码信息，包括密码更改时间，密码是否已重置等
  pw: {
    cng_at: number
    reset: boolean
    must_reset: boolean
  }
  // 手机号是否已验证
  phone_number_verified: boolean
  account_verified: boolean
  ppid: string | null
  // 绑定的第三方服务详情
  federated_identity_details: Array<{
    provider_name: string
    provider_environment: string | null
  }>
  // 已绑定的第三方服务 ['google', 'xbox', ...reset]
  federated_identity_providers: Array<string>
  // 用户账户的语言环境设定
  player_locale: string
  // 用户账户的相关信息
  acct: {
    type: number
    // 账户状态（是否被封禁）
    state: string
    // 是否是管理员
    adm: boolean
    // 游戏名
    game_name: string
    // 游戏名后面的 tag
    tag_line: string
    // 账户创建的时间
    created_at: number
  }
  // 用户年龄
  age: number
  jti: string
  affinity: {
    pp: string
  }
  player_plocale: string | null
}
