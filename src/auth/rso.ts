import { type ParsedRSOAuthResult, parseRSOAuthResUri } from '../utils/rso'
import type { AuthResponse } from '../types'

export class RSO {
  private entitlementsToken: string

  private parsedRSOAuthResult: ParsedRSOAuthResult

  private riotClientPlatform =
    'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9'

  private static riotClientBuild = '77.0.1.814.2013'

  private static riotClientVersion = 'release-07.12-shipping-15-2164217'

  public static updateRiotClientInfo(info: { version: string; build: string }) {
    RSO.riotClientBuild = info.build
    RSO.riotClientVersion = info.version
  }

  // public static get getRiotClientAgent() {
  //   return `RiotClient/${RSO.riotClientBuild} rso-auth (Windows;10;;Professional, x64)`
  // }

  public static get getRiotClientVersion() {
    return RSO.riotClientVersion
  }

  constructor(entitlementsToken: string, authResult: AuthResponse) {
    this.parsedRSOAuthResult = this.updateParsedRSOAuthResult(authResult)
    this.entitlementsToken = this.updateEntitlementsToken(entitlementsToken)
  }

  public updateParsedRSOAuthResult(authResult: AuthResponse) {
    const parsedRSOAuthResult = parseRSOAuthResUri(authResult)
    if (parsedRSOAuthResult == null) {
      throw new Error('Failed to parse RSO authorization results')
    }
    this.parsedRSOAuthResult = parsedRSOAuthResult
    return parsedRSOAuthResult
  }

  public updateEntitlementsToken(entitlementsToken: string) {
    this.entitlementsToken = entitlementsToken
    return entitlementsToken
  }

  public getRequestHeader() {
    return {
      'X-Riot-ClientVersion': RSO.getRiotClientVersion,
      'X-Riot-ClientPlatform': this.riotClientPlatform,
      'X-Riot-Entitlements-JWT': this.entitlementsToken,
      Authorization: `${this.parsedRSOAuthResult.tokenType} ${this.parsedRSOAuthResult.accessToken}`,
    }
  }
}
