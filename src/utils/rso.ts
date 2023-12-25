export enum APIS {
  AUTH_URL = 'https://auth.riotgames.com/api/v1/authorization',
  REGION_URL = 'https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant',
  ENTITLEMENTS_URL = 'https://entitlements.auth.riotgames.com/api/token/v1/',
  PLAYER_INFO_URL = 'https://auth.riotgames.com/userinfo',
}

const PING_BODY = {
  client_id: 'play-valorant-web-prod',
  nonce: '1',
  redirect_uri: 'https://playvalorant.com/opt_in',
  response_type: 'token id_token',
  scope: 'account openid',
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

export function getMultiFactorBody(config: {
  code: string
  rememberDevice: boolean
}) {
  const multiFactorBody = { ...MULTI_FACTOR_BODY }
  multiFactorBody.code = config.code
  multiFactorBody.rememberDevice = config.rememberDevice
  return multiFactorBody
}

export function parseRSOAuthResUri(authResult: {
  response: { parameters: { uri: string } }
}) {
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
