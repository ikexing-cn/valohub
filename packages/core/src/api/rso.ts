import {
  APIS,
  getAuthBody,
  getAuthorizationHeader,
  getMultiFactorBody,
  getPingBody,
  getRegionBody,
} from '../utils/rso'
import type { ParsedRSOAuthResult } from '../types'

export function createRSOApi(parsedRSOAuthResult?: ParsedRSOAuthResult) {
  return {
    getAuthPing: () => {
      return {
        url: APIS.AUTH_URL,
        fetchConfig: {
          method: 'POST',
          body: getPingBody(),
        },
      }
    },

    getAuthLogin: (accountInfo: {
      username: string
      password: string
      remember: boolean
    }) => {
      return {
        url: APIS.AUTH_URL,
        fetchConfig: {
          method: 'PUT',
          body: getAuthBody(accountInfo),
        },
      }
    },

    getAuthMultiFactor: (mfaInfo: {
      code: string
      rememberDevice: boolean
    }) => {
      return {
        url: APIS.AUTH_URL,
        fetchConfig: {
          method: 'PUT',
          body: getMultiFactorBody(mfaInfo),
        },
      }
    },

    getRegion: () => {
      if (!parsedRSOAuthResult) {
        throw new Error('This function requires a parsedRSOAuthResult')
      }

      return {
        url: APIS.REGION_URL,
        fetchConfig: {
          method: 'PUT',
          body: getRegionBody(parsedRSOAuthResult),
          headers: getAuthorizationHeader(parsedRSOAuthResult),
        },
      }
    },

    getEntitlementToken: () => {
      if (!parsedRSOAuthResult) {
        throw new Error('This function requires a parsedRSOAuthResult')
      }

      return {
        url: APIS.ENTITLEMENTS_URL,
        fetchConfig: {
          method: 'POST',
          headers: getAuthorizationHeader(parsedRSOAuthResult),
        },
      }
    },

    getPlayerInfo: () => {
      if (!parsedRSOAuthResult) {
        throw new Error('This function requires a parsedRSOAuthResult')
      }

      return {
        url: APIS.PLAYER_INFO_URL,
        fetchConfig: {
          headers: getAuthorizationHeader(parsedRSOAuthResult),
        },
      }
    },
  }
}
