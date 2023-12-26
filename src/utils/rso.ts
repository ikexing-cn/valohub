import type { AuthResponse, NotNull } from '../types'

export enum APIS {
  PLAYER_INFO_URL = 'https://auth.riotgames.com/userinfo',
  AUTH_URL = 'https://auth.riotgames.com/api/v1/authorization',
  ENTITLEMENTS_URL = 'https://entitlements.auth.riotgames.com/api/token/v1/',
  REGION_URL = 'https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant',
}

const PING_BODY = {
  nonce: '1',
  scope: 'account openid',
  response_type: 'token id_token',
  client_id: 'play-valorant-web-prod',
  redirect_uri: 'https://playvalorant.com/opt_in',
}

const AUTH_BODY = {
  type: 'auth',
  remember: false,
  language: 'en_US',
  username: '{username}',
  password: '{password}',
}

const MULTI_FACTOR_BODY = {
  code: '{code}',
  type: 'multifactor',
  rememberDevice: false,
}

export function getPingBody() {
  return PING_BODY
}

export function getAuthBody(config: {
  username: string
  password: string
  remember: boolean
}) {
  const authBody = { ...AUTH_BODY }
  authBody.username = config.username
  authBody.password = config.password
  authBody.remember = config.remember
  return authBody
}

export function getRegionBody(parsedRSOAuthResult: ParsedRSOAuthResult) {
  return {
    id_token: parsedRSOAuthResult.idToken,
  }
}

export function getAuthorizationHeader(
  parsedRSOAuthResult: ParsedRSOAuthResult,
) {
  return {
    Authorization: `${parsedRSOAuthResult.tokenType} ${parsedRSOAuthResult.accessToken}`,
  }
}

export function getMultiFactorBody(config: {
  code: string
  rememberDevice: boolean
}) {
  const multiFactorBody = { ...MULTI_FACTOR_BODY }
  multiFactorBody.code = config.code
  multiFactorBody.rememberDevice = config.rememberDevice
  return multiFactorBody
}

export type ParsedRSOAuthResult = NotNull<ReturnType<typeof parseRSOAuthResUri>>
export function parseRSOAuthResUri(authResult: AuthResponse) {
  const regex =
    /^http(s)?:\/\/.*(#|\?)access_token=(.*)&scope=(.*)&iss=(.*)&id_token=(.*)&token_type=(\w+)&session_state=(.*)&expires_in=(\d+)$/
  const parseResult = regex.exec(authResult.response.parameters.uri)
  if (!parseResult) return null

  return {
    accessToken: parseResult[3],
    scope: parseResult[4],
    iss: parseResult[5],
    idToken: parseResult[6],
    tokenType: parseResult[7],
    sessionState: parseResult[8],
    expiresIn: parseResult[9],
  }
}
