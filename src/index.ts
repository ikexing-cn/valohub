import { createRequest } from './request'
import {
  APIS,
  type ParsedRSOAuthResult,
  getAuthBody,
  getAuthorizationHeader,
  getMultiFactorBody,
  getPingBody,
  getRegionBody,
} from './utils/rso'
import type { InGameApiInstance } from './api/in-game'
import type {
  AuthLoginResponse,
  AuthResponseOrFailure,
  EntitlementTokenResponse,
  PlayerInfoResponse,
  RegionResponse,
} from './types'

const request = createRequest()

export async function fetchGetAuthCookies() {
  await request(APIS.AUTH_URL, {
    method: 'POST',
    body: getPingBody(),
  })
}

export function fetchAuthLogin(accountInfo: {
  username: string
  password: string
  remember: boolean
}) {
  return request<AuthLoginResponse>(APIS.AUTH_URL, {
    method: 'PUT',
    body: getAuthBody(accountInfo),
  })
}

export function fetchMultiFactorAuth(mfaInfo: {
  code: string
  rememberDevice: boolean
}) {
  return request<AuthResponseOrFailure>(APIS.AUTH_URL, {
    method: 'PUT',
    body: getMultiFactorBody(mfaInfo),
  })
}

export function fetchGetRegion(parsedRSOAuthResult: ParsedRSOAuthResult) {
  return request<RegionResponse>(APIS.REGION_URL, {
    method: 'PUT',
    body: getRegionBody(parsedRSOAuthResult),
    headers: getAuthorizationHeader(parsedRSOAuthResult),
  })
}

export function fetchGetEntitlementToken(
  parsedRSOAuthResult: ParsedRSOAuthResult,
) {
  return request<EntitlementTokenResponse>(APIS.ENTITLEMENTS_URL, {
    method: 'POST',
    headers: getAuthorizationHeader(parsedRSOAuthResult),
  })
}

export function fetchGetPlayerInfo(parsedRSOAuthResult: ParsedRSOAuthResult) {
  return request<PlayerInfoResponse>(APIS.PLAYER_INFO_URL, {
    headers: getAuthorizationHeader(parsedRSOAuthResult),
  })
}

export function fetchGetStoreFrontInfo({
  inGame,
  userId,
  parsedRSOAuthResult,
  entitlementsToken,
}: {
  userId: string
  entitlementsToken: string
  inGame: InGameApiInstance
  parsedRSOAuthResult: ParsedRSOAuthResult
}) {
  return request(inGame.StoreFront(userId), {
    method: 'GET',
    headers: {
      Authorization: `${parsedRSOAuthResult.tokenType} ${parsedRSOAuthResult.accessToken}`,
      'X-Riot-Entitlements-JWT': entitlementsToken,
    },
  })
}
