import {
  APIS,
  getAuthBody,
  getAuthorizationHeader,
  getMultiFactorBody,
  getPingBody,
  getRegionBody,
} from '../utils/rso'
import type { RequestFunction } from '@valorant-bot/shared'
import type { InGameApiInstance, ParsedRSOAuthResult } from '../types'
import type {
  AuthLoginResponse,
  AuthResponseOrFailure,
  EntitlementTokenResponse,
  PlayerInfoResponse,
  RegionResponse,
} from '../types/request'

export type RSOApis = ReturnType<typeof createRSOApi>
export function createRSOApi(request: RequestFunction) {
  async function fetchAuthPing() {
    await request(APIS.AUTH_URL, {
      method: 'POST',
      body: getPingBody(),
    })
  }

  function fetchAuthLogin(accountInfo: {
    username: string
    password: string
    remember: boolean
  }) {
    return request<AuthLoginResponse>(APIS.AUTH_URL, {
      method: 'PUT',
      body: getAuthBody(accountInfo),
    })
  }

  function fetchAuthMultiFactor(mfaInfo: {
    code: string
    rememberDevice: boolean
  }) {
    return request<AuthResponseOrFailure>(APIS.AUTH_URL, {
      method: 'PUT',
      body: getMultiFactorBody(mfaInfo),
    })
  }

  function fetchGetRegion(parsedRSOAuthResult: ParsedRSOAuthResult) {
    return request<RegionResponse>(APIS.REGION_URL, {
      method: 'PUT',
      body: getRegionBody(parsedRSOAuthResult),
      headers: getAuthorizationHeader(parsedRSOAuthResult),
    })
  }

  function fetchGetEntitlementToken(parsedRSOAuthResult: ParsedRSOAuthResult) {
    return request<EntitlementTokenResponse>(APIS.ENTITLEMENTS_URL, {
      method: 'POST',
      headers: getAuthorizationHeader(parsedRSOAuthResult),
    })
  }

  function fetchGetPlayerInfo(parsedRSOAuthResult: ParsedRSOAuthResult) {
    return request<PlayerInfoResponse>(APIS.PLAYER_INFO_URL, {
      headers: getAuthorizationHeader(parsedRSOAuthResult),
    })
  }

  // TODO: remove later
  function fetchGetStoreFrontInfo({
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

  return {
    fetchAuthPing,
    fetchAuthLogin,
    fetchAuthMultiFactor,
    fetchGetRegion,
    fetchGetEntitlementToken,
    fetchGetPlayerInfo,
    fetchGetStoreFrontInfo,
  }
}
