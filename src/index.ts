import { createRequest } from './request'
import {
  APIS,
  type ParsedRSOAuthResUri,
  getAuthBody,
  getMultiFactorBody,
  getPingBody,
} from './utils/rso'
import type { InGameApiInstance } from './api/in-game'
import type { PutAuthRequestResponse } from './types'

const request = createRequest()

export async function fetchGetAuthCookies() {
  await request(APIS.AUTH_URL, {
    method: 'POST',
    body: getPingBody(),
  })
}

export async function fetchAuthLogin(accountInfo: {
  username: string
  password: string
  remember: boolean
}) {
  const result = await request(APIS.AUTH_URL, {
    method: 'PUT',
    body: getAuthBody(accountInfo),
  })

  return result.json() as Promise<PutAuthRequestResponse>
}

export function fetchMultiFactorAuth(mfaInfo: {
  code: string
  rememberDevice: boolean
}) {
  return request(APIS.AUTH_URL, {
    method: 'PUT',
    body: getMultiFactorBody(mfaInfo),
  })
}

export async function fetchGetRegion(rsoAuthResUri: ParsedRSOAuthResUri) {
  const result = await request(APIS.REGION_URL, {
    method: 'PUT',
    headers: {
      Authorization: `${rsoAuthResUri.tokenType} ${rsoAuthResUri.accessToken}`,
    },
    body: {
      id_token: rsoAuthResUri.idToken,
    },
  })
  return result.json() as Promise<{
    token: string
    affinities: {
      pbe: string
      live: string
    }
  }>
}

export async function fetchGetEntitlementToken(
  rsoAuthResUri: ParsedRSOAuthResUri,
) {
  const result = await request(APIS.ENTITLEMENTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `${rsoAuthResUri.tokenType} ${rsoAuthResUri.accessToken}`,
    },
  })
  return result.json() as Promise<{
    entitlements_token: string
  }>
}

export async function fetchGetPlayerInfo(rsoAuthResUri: ParsedRSOAuthResUri) {
  const result = await request(APIS.PLAYER_INFO_URL, {
    headers: {
      Authorization: `${rsoAuthResUri.tokenType} ${rsoAuthResUri.accessToken}`,
    },
  })
  return result.json()
}

export async function fetchGetStoreFrontInfo({
  inGame,
  userId,
  rsoAuthResUri,
  entitlementsToken,
}: {
  userId: string
  entitlementsToken: string
  inGame: InGameApiInstance
  rsoAuthResUri: ParsedRSOAuthResUri
}) {
  const result = await request(inGame.StoreFront(userId), {
    method: 'GET',
    headers: {
      Authorization: `${rsoAuthResUri.tokenType} ${rsoAuthResUri.accessToken}`,
      'X-Riot-Entitlements-JWT': entitlementsToken,
    },
  })

  return result.json()
}
