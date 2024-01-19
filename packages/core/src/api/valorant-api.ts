import { replacePlaceholder } from '../utils/api'

export type ValorantApiLanguage = 'en-US' | 'zh-CN' | 'zh-TW'

const BASE_DOMAIN = 'https://valorant-api.com/v1'

function genValorantApiApi(language: string, url: string) {
  return `${BASE_DOMAIN}${url}?language=${language}`
}

export function createValorantApi(_language?: ValorantApiLanguage) {
  const language = _language || 'zh-TW'

  return {
    getWeaponLevelFromUUID: (uuid: string) =>
      replacePlaceholder(
        genValorantApiApi(language, '/weapons/skinlevels/{uuid}'),
        uuid,
      ),
  }
}
